export default function TaskPage({ id }){
  return (<div style={{padding:20}}>
    <h1>Flex task started</h1>
    <p>Task ID: {id}</p>
    <p>This is a stub page. Your task workflow will initiate here.</p>
  </div>);
}
export async function getServerSideProps({ params }){ return { props: { id: params.id } }; }