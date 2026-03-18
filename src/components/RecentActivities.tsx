import { Camera, TreePine, Droplets, Recycle, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  { icon: TreePine, school: "ZP School, Shirdi", activity: "Tree Plantation Drive — 50 saplings planted", time: "2 hours ago", type: "plantation" },
  { icon: Droplets, school: "Municipal School, Pune", activity: "Rainwater Harvesting Workshop", time: "5 hours ago", type: "water" },
  { icon: Recycle, school: "Govt. HS, Nagpur", activity: "Plastic-Free Week Campaign", time: "1 day ago", type: "waste" },
  { icon: Camera, school: "KV, Thane", activity: "Nature Photography Walk — 30 students", time: "1 day ago", type: "awareness" },
  { icon: Wind, school: "Adarsh Vidyalaya, Kolhapur", activity: "Clean Air Survey submitted", time: "2 days ago", type: "air" },
];

const typeColors: Record<string, string> = {
  plantation: "bg-eco-green-light text-eco-green",
  water: "bg-eco-sky-light text-eco-sky",
  waste: "bg-eco-amber-light text-eco-amber",
  awareness: "bg-accent text-accent-foreground",
  air: "bg-muted text-muted-foreground",
};

interface Props {
  lang: "en" | "mr";
}

const RecentActivities = ({ lang }: Props) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">
          {lang === "en" ? "Recent Activities" : "अलीकडील उपक्रम"}
        </h3>
      </div>
      <div className="divide-y divide-border">
        {activities.map((act, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", typeColors[act.type])}>
              <act.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground leading-snug">{act.activity}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{act.school}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{act.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;
