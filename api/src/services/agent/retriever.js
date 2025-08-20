import Article from '../../models/Article.js';

export async function retrieveKB(queryText){
  // naive retrieval: text search + simple scoring
  const results = await Article.find({ status:'published', $text: { $search: queryText } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(3)
    .lean();

  if(results.length) return results;

  // fallback: regex search on title/body
  const rx = new RegExp(queryText.split('\s+').slice(0,3).join('|'), 'i');
  return Article.find({ status:'published', $or:[{title: rx}, {body: rx}] }).limit(3).lean();
}
