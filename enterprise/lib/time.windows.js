export function timeMultipliers(now=new Date()){
  const m = baseMultipliers();
  const daysToMonthEnd = daysToEndOfMonth(now);
  const daysToQuarterEnd = daysToEndOfQuarter(now);
  const daysToWeekEnd = daysToEndOfWeek(now);
  const res = {};
  res.month_end = daysToMonthEnd<=3 ? m.month_end : 1;
  res.quarter_end = daysToQuarterEnd<=7 ? m.quarter_end : 1;
  res.week_end = daysToWeekEnd<=2 ? m.week_end : 1;
  return res;
}

export function baseMultipliers(){
  return { month_end:1.15, quarter_end:1.25, week_end:1.05 };
}

function daysToEndOfMonth(now){
  const end = new Date(now.getFullYear(), now.getMonth()+1, 0);
  return Math.max(0, Math.ceil((end - now)/(24*3600*1000)));
}
function daysToEndOfQuarter(now){
  const qEndMonth = [2,5,8,11][Math.floor(now.getMonth()/3)];
  const end = new Date(now.getFullYear(), qEndMonth+1, 0);
  return Math.max(0, Math.ceil((end - now)/(24*3600*1000)));
}
function daysToEndOfWeek(now){
  const day = now.getDay();
  const daysLeft = (6 - day);
  return daysLeft;
}
