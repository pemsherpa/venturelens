import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarDataPoint {
  axis: string;
  value: number;
  fullMark: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  onCategoryClick?: (category: string) => void;
}

export function RadarChart({ data, onCategoryClick }: RadarChartProps) {
  const handleClick = (e: any) => {
    if (e && e.activeLabel && onCategoryClick) {
      onCategoryClick(e.activeLabel);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsRadarChart 
        data={data} 
        cx="50%" 
        cy="50%" 
        outerRadius="75%"
        onClick={handleClick}
        style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
      >
        <PolarGrid
          stroke="hsl(230, 20%, 25%)"
          strokeDasharray="3 3"
        />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 12 }}
          tickLine={false}
          onClick={(e: any) => onCategoryClick && onCategoryClick(e.value)}
          style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(230, 25%, 12%)",
            border: "1px solid hsl(230, 20%, 18%)",
            borderRadius: "12px",
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
          }}
          labelStyle={{ color: "hsl(220, 20%, 95%)", fontWeight: 600 }}
          itemStyle={{ color: "hsl(239, 84%, 67%)" }}
          formatter={(value: number) => [`${value}%`, 'Score']}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="hsl(239, 84%, 67%)"
          fill="hsl(239, 84%, 67%)"
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
