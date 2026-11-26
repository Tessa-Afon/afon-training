import { ukToday } from "@/lib/availability";
import { canEdit, requireStaff } from "@/lib/staff";
import { loadPlanner, plannerWindow } from "@/lib/planner";
import PlannerView from "./PlannerView";

type Props = { searchParams: Promise<{ months?: string; from?: string; notice?: string }> };

export default async function Planner({ searchParams }: Props) {
  const staff = await requireStaff();
  const params = await searchParams;
  const { span, from, thisMonth } = plannerWindow(params);
  const months = await loadPlanner(staff, from, span);
  return (
    <PlannerView
      months={months}
      span={span}
      from={from}
      thisMonth={thisMonth}
      today={ukToday()}
      editor={canEdit(staff)}
      notice={params.notice}
    />
  );
}
