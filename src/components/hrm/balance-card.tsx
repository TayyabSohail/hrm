import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type BalanceCardProps = {
  title: string;
  used: number;
  total: number;
  format?: (value: number) => string;
  hint?: string;
  mode?: 'consumed' | 'accrued';
};

export function BalanceCard({
  title,
  used,
  total,
  format = String,
  hint,
  mode = 'consumed',
}: BalanceCardProps) {
  const isAccrued = mode === 'accrued';
  const headline = isAccrued ? used : Math.max(0, total - used);
  const percentFilled = total > 0 ? Math.min(100, (used / total) * 100) : 0;

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <div className='flex items-baseline justify-between gap-2'>
          <p className='text-3xl font-bold tracking-tight'>
            {format(headline)}
          </p>
          <p className='text-sm text-muted-foreground'>
            {isAccrued
              ? `of ${format(total)} maximum`
              : `of ${format(total)} left`}
          </p>
        </div>
        <Progress
          value={percentFilled}
          aria-label={
            isAccrued
              ? `${title}: ${format(used)} available of ${format(total)}`
              : `${title}: ${format(used)} used of ${format(total)}`
          }
        />
        <p className='text-xs text-muted-foreground'>
          {isAccrued
            ? `${format(Math.max(0, total - used))} more to reach the cap`
            : `${format(used)} used`}
          {hint ? ` · ${hint}` : ''}
        </p>
      </CardContent>
    </Card>
  );
}
