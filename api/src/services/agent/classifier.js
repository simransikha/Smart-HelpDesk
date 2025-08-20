// Stub classifier using keywords + heuristic confidence
const categories = ['billing','tech','shipping','other'];

function score(text, words){
  let hits = 0;
  for(const w of words){
    if(text.includes(w)) hits++;
  }
  return hits / Math.max(1, words.length);
}

export function classify(text){
  const t = text.toLowerCase();
  const billingScore = Math.max(
    score(t, ['refund','invoice','double charged','billing','payment','chargeback']),
    0
  );
  const techScore = Math.max(
    score(t, ['error','bug','issue','stack','login','password','e101','e102']),
    0
  );
  const shippingScore = Math.max(
    score(t, ['delivery','shipment','shipping','late','tracking','courier']),
    0
  );

  const scores = { billing: billingScore, tech: techScore, shipping: shippingScore, other: 0.1 };
  let predictedCategory = 'other'; let max = 0.1;
  for(const c of ['billing','tech','shipping']){
    if(scores[c] > max){ max = scores[c]; predictedCategory = c; }
  }
  const confidence = Math.min(1, 0.6 + max * 0.4); // pseudo-confidence 0.6..1.0
  return { predictedCategory, confidence };
}
