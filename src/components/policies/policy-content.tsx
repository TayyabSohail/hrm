type PolicyContentProps = {
  html: string;
};

export function PolicyContent({ html }: PolicyContentProps) {
  return (
    <div
      className='[&_.policy-diff-added]:-mx-2 [&_.policy-diff-added]:rounded [&_.policy-diff-added]:bg-green-500/15 [&_.policy-diff-added]:px-2 [&_.policy-diff-added]:py-0.5 [&_.policy-diff-added]:text-foreground [&_.policy-diff-removed]:-mx-2 [&_.policy-diff-removed]:rounded [&_.policy-diff-removed]:bg-red-500/15 [&_.policy-diff-removed]:px-2 [&_.policy-diff-removed]:py-0.5 [&_.policy-diff-removed]:text-muted-foreground [&_.policy-diff-removed]:line-through [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_li]:mb-1 [&_li]:text-sm [&_li]:text-muted-foreground [&_p]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5'
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
