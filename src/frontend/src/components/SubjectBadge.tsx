import { Badge } from "@/components/ui/badge";

interface Props {
  subject: string;
}

export function SubjectBadge({ subject }: Props) {
  const colorMap: Record<string, string> = {
    JEE: "bg-blue-accent/20 text-blue-300 border-blue-accent/30",
    NEET: "bg-green-500/20 text-green-300 border-green-500/30",
    Mixed: "bg-primary/20 text-teal border-primary/30",
  };
  const cls = colorMap[subject] ?? colorMap.Mixed;
  return (
    <Badge
      variant="outline"
      className={`text-xs font-semibold px-2 py-0.5 ${cls}`}
    >
      {subject}
    </Badge>
  );
}
