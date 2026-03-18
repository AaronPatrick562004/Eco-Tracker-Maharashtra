import { Construction } from "lucide-react";

interface Props {
  title: string;
  titleMr: string;
  description: string;
  lang: "en" | "mr";
}

const ModulePlaceholder = ({ title, titleMr, description, lang }: Props) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
          <Construction className="w-8 h-8 text-accent-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          {lang === "en" ? title : titleMr}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default ModulePlaceholder;
