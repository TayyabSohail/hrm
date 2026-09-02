import 'server-only';

import Logger from '@/utils/logger';

import type { Json } from '@/types/supabase';


const ENDPOINT = 'https://api.fireflies.ai/graphql';

const TOKEN_PREFIX = 'bsm';

export type FirefliesResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; rateLimited?: boolean };

function apiKey() {
  return process.env.FIREFLIES_API_KEY ?? '';
}

export function generateCorrelationToken() {
  return `${TOKEN_PREFIX}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function buildMeetingTitle(userTitle: string, token: string) {
  // Fireflies caps title at 256 chars; leave room for the token suffix.
  const suffix = ` [${token}]`;
  const room = 256 - suffix.length;
  return `${userTitle.trim().slice(0, room)}${suffix}`;
}

export function extractCorrelationToken(title: string | null | undefined) {
  if (!title) return null;
  const match = title.match(/\[(bsm_[a-f0-9]{12})\]/i);
  return match ? match[1].toLowerCase() : null;
}

async function graphql<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<FirefliesResult<T>> {
  const key = apiKey();
  if (!key) {
    return { ok: false, error: 'Fireflies is not configured (missing API key).' };
  }

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    });
  } catch (error) {
    Logger.error('[fireflies] network error', error);
    return { ok: false, error: 'Could not reach Fireflies.' };
  }

  const text = await response.text();
  let body: { data?: T; errors?: { message?: string; code?: string }[] };
  try {
    body = JSON.parse(text) as typeof body;
  } catch {
    Logger.error('[fireflies] non-JSON response', { status: response.status, text });
    return { ok: false, error: 'Fireflies returned an unreadable response.' };
  }

  if (body.errors?.length) {
    const first = body.errors[0];
    const message = first?.message ?? 'Fireflies rejected the request.';
    // The documented shape is `too_many_requests`; match loosely so a wording
    // change still surfaces as a rate limit rather than a generic failure.
    const rateLimited =
      response.status === 429 ||
      /too_many_requests|rate.?limit/i.test(`${first?.code ?? ''} ${message}`);
    Logger.error('[fireflies] api error', { status: response.status, errors: body.errors });
    return { ok: false, error: message, rateLimited };
  }

  if (!body.data) {
    return { ok: false, error: 'Fireflies returned no data.' };
  }
  return { ok: true, data: body.data };
}

export async function addToLiveMeeting(input: {
  meetingLink: string;
  title: string;
  language: string;
}) {
  return graphql<{ addToLiveMeeting: { success: boolean } }>(
    `mutation AddToLive($meetingLink: String!, $title: String, $language: String) {
       addToLiveMeeting(meeting_link: $meetingLink, title: $title, language: $language) {
         success
       }
     }`,
    {
      meetingLink: input.meetingLink,
      title: input.title,
      language: input.language,
    },
  );
}

export async function fetchTranscriptTitle(meetingId: string) {
  return graphql<{ transcript: { title: string | null } | null }>(
    `query TranscriptTitle($id: String!) { transcript(id: $id) { title } }`,
    { id: meetingId },
  );
}

export type FirefliesTranscript = {
  id: string;
  title: string | null;
  transcript_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  duration: number | null;
  dateString: string | null;
  summary: Json | null;
  sentences: { speaker_name: string | null; text: string | null; start_time: number | null }[] | null;
};

export async function fetchTranscript(meetingId: string) {
  return graphql<{ transcript: FirefliesTranscript | null }>(
    `query Transcript($id: String!) {
       transcript(id: $id) {
         id
         title
         transcript_url
         audio_url
         video_url
         duration
         dateString
         summary {
           overview
           short_summary
           action_items
           keywords
           outline
           bullet_gist
         }
         sentences {
           speaker_name
           text
           start_time
         }
       }
     }`,
    { id: meetingId },
  );
}
