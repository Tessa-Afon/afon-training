import { ukToday } from "@/lib/availability";
import { requireStaff } from "@/lib/staff";
import { loadPlanner, plannerWindow } from "@/lib/planner";
import PlannerView from "./PlannerView";

type Props = { searchParams: Promise<{ months?: string; from?: string }> };

export default async function Planner({ searchParams }: Props) {
  const staff = await requireStaff();
  const { span, from, thisMonth } = plannerWindow(await searchParams);
  const months = await loadPlanner(staff, from, span);
  return <PlannerView months={months} span={span} from={from} thisMonth={thisMonth} today={ukToday()} />;
}
