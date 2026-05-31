// src/components/exam/QuestionCard.jsx
import Card from '../common/Card.jsx';

export default function QuestionCard({ questionText }) {
  return (
    <Card variant="bubble">
      <p className="text-base sm:text-lg font-bold leading-relaxed text-slate-800 italic">
        "{questionText}"
      </p>
    </Card>
  );
}