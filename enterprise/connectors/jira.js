export async function findTickets({ jql }){
  await new Promise(r=>setTimeout(r, 40));
  return [{ key:'WB-101', summary:'Add Tsunami approvals', status:'To Do', jql }];
}
