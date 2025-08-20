export function draft({ text, articles }){
  const cites = (articles||[]).map((a,i)=>`[${i+1}] ${a.title}`).join('\n');
  const citationIds = (articles||[]).map(a=>a._id.toString());
  const body = `Thanks for reaching out! Based on your message, here are some steps that should help:

- ${articles[0] ? articles[0].title : 'We are looking into this for you.'}
${articles[1] ? '- ' + articles[1].title : ''}
${articles[2] ? '- ' + articles[2].title : ''}

References:
${cites || '- (No relevant knowledge base articles yet)'} 

If this resolves your issue, we will go ahead and close the ticket. If not, reply and a human agent will assist further.`;

  return { draftReply: body.trim(), citations: citationIds };
}
