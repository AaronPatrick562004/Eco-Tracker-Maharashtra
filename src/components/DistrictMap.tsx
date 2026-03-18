import { MapPin } from "lucide-react";

const districts = [
  { name: "Pune", schools: 4200, compliance: 82 },
  { name: "Mumbai", schools: 3800, compliance: 78 },
  { name: "Nagpur", schools: 3100, compliance: 91 },
  { name: "Nashik", schools: 2900, compliance: 75 },
  { name: "Thane", schools: 2700, compliance: 88 },
  { name: "Aurangabad", schools: 2400, compliance: 70 },
  { name: "Kolhapur", schools: 2100, compliance: 65 },
  { name: "Solapur", schools: 1900, compliance: 72 },
];

interface Props {
  lang: "en" | "mr";
}

const DistrictMap = ({ lang }: Props) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-card">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">
          {lang === "en" ? "District Overview" : "जिल्हा विहंगावलोकन"}
        </h3>
      </div>
      <div className="p-5 grid grid-cols-2 gap-3">
        {districts.map((d) => (
          <div
            key={d.name}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.schools.toLocaleString()} {lang === "en" ? "schools" : "शाळा"}</p>
            </div>
            <div className="text-right">
              <span
                className={`text-sm font-bold ${
                  d.compliance >= 80
                    ? "text-eco-green"
                    : d.compliance >= 70
                    ? "text-eco-amber"
                    : "text-eco-red"
                }`}
              >
                {d.compliance}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistrictMap;
