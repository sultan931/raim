import './ParentHintCard.css';

type ParentHintCardProps = {
  hint: string;
  labels: {
    noHint: string;
    parentSignal: string;
  };
};

export function ParentHintCard({ hint, labels }: ParentHintCardProps) {
  return (
    <aside className="parent-hint">
      <span>{labels.parentSignal}</span>
      <p>{hint || labels.noHint}</p>
    </aside>
  );
}
