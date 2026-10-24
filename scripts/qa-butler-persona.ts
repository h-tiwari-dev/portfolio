import { initialMemory } from '../lib/voice/dialogue';
import { acceptAnswer, cleanTranscript, fixNames, planReply, retell, splitSentences, thirdPerson } from '../lib/butler/persona';

const failures: string[] = [];

function check(name: string, condition: boolean, detail = '') {
  if (!condition) failures.push(detail ? `${name}: ${detail}` : name);
}

check('third person am', thirdPerson('I am building voice agents.') === 'He is building voice agents.', thirdPerson('I am building voice agents.'));
check('third person verb', thirdPerson('I watch the p95. I like it.') === 'He watches the p95. He likes it.', thirdPerson('I watch the p95. I like it.'));
check('third person my', thirdPerson('That was my team.') === 'That was his team.');
check('retell', /^(Certainly|Of course|Indeed)\. Mr Tiwari led the migration\.$/.test(retell('He led the migration.')), retell('He led the migration.'));

check('fix castler', fixNames('payments at Carcelor?') === 'payments at Castler?', fixNames('payments at Carcelor?'));
check('fix cashler', fixNames('What about Cashler') === 'What about Castler', fixNames('What about Cashler'));
check('fix kusho', fixNames('work at Cussow') === 'work at Kusho', fixNames('work at Cussow'));
for (const [heard, name] of [
  ['his time at Kashu.', 'his time at Kusho.'],
  ['payments at CASLO?', 'payments at Castler?'],
  ['Tell me about casserole', 'Tell me about Castler'],
  ['at least he tried', 'at least he tried'],
  ['about coding', 'about coding'],
  ['with caution', 'with caution'],
  ['about the cashier', 'about the cashier'],
]) {
  check(`slot ${heard}`, fixNames(heard) === name, fixNames(heard));
}
check('fix kaso', fixNames('What did he build at kaso?') === 'What did he build at Kusho?', fixNames('What did he build at kaso?'));
check('fix wellness', fixNames('wellness living') === 'WellnessLiving');
check('fix leaves words', fixNames('How did he stop double payments?') === 'How did he stop double payments?');

check('drop filler', cleanTranscript('you') === '' && cleanTranscript('Thanks for watching!') === '');
check('drop brackets', cleanTranscript('[music] Tell me about Kusho') === 'Tell me about Kusho');
check('split', splitSentences('One. Two? Three').length === 3);
check('split keeps decimals', splitSentences('OAuth 2.0 is on both. Then p95 at 0.8 s.').length === 2, JSON.stringify(splitSentences('OAuth 2.0 is on both. Then p95 at 0.8 s.')));
const oauth = planReply('How does he handle OAuth?');
if (oauth.kind === 'think') {
  const verbatim = acceptAnswer(oauth.note, oauth.note, oauth.question);
  check('accepts verbatim oauth', verbatim.grounded, verbatim.text);
  const was = acceptAnswer(oauth.note.replace('OAuth 2.0 is on', 'OAuth 2.0 was on'), oauth.note, oauth.question);
  check('rejects tense swap after number', !was.grounded, was.text);
}
check('split abbreviations', splitSentences('Based in the U.K. since 2021. Then more.').length === 2, JSON.stringify(splitSentences('Based in the U.K. since 2021. Then more.')));
check('split curly quotes', splitSentences('He said “under a second.” Then left.').length === 2);
check('split ellipsis', splitSentences('I am told... it was fast.').length === 1);
const latency = planReply('How fast are his voice agents?');
if (latency.kind === 'think') {
  const over = acceptAnswer(latency.note.replace('under a second', 'over a second'), latency.note, latency.question);
  check('rejects over/under flip', !over.grounded, over.text);
  const notUnder = acceptAnswer(latency.note.replace('is under a second', 'is not under a second'), latency.note, latency.question);
  check('rejects not under', !notUnder.grounded, notUnder.text);
}
const kusho = planReply('What did he do at Kusho?');
if (kusho.kind === 'think') {
  const months = acceptAnswer(kusho.note.replace('August 2023 to April 2025', 'April 2023 to August 2025'), kusho.note, kusho.question);
  const range = acceptAnswer(kusho.note.replace('August 2023 to April 2025', 'August 2023 and April 2025'), kusho.note, kusho.question);
  check('rejects lost range', !range.grounded, range.text);
  check('rejects month swap', !months.grounded || !/August 2023/.test(kusho.note), `${months.text} | ${kusho.note}`);
}

const hello = planReply('hello');
check('hello says', hello.kind === 'say' && hello.text.includes('butler'), JSON.stringify(hello));
const weather = planReply('What is the weather like today?');
check('off topic declines', weather.kind === 'say' && /remit/.test(weather.text), JSON.stringify(weather));

const castler = planReply('How did he stop double payments at Castler?');
check('castler thinks', castler.kind === 'think');
if (castler.kind === 'think') {
  check('castler note', /idempotency/i.test(castler.note), castler.note);
  check('note third person', !/\bI\b|\bmy\b/.test(castler.note), castler.note);
  const after = planReply('What came after that?', castler.memory);
  check('follow up', after.kind === 'think' && /Kusho/.test(after.note), JSON.stringify(after));

  const good = acceptAnswer('Quite so. The platform was event driven. Idempotency keys and circuit breakers. A retry was not allowed to move the money twice.', castler.note, castler.question);
  check('accepts grounded', good.grounded, good.text);
  const name = acceptAnswer('He used Stripe and idempotency keys so a retry never moved money twice.', castler.note, castler.question);
  check('rejects unknown name', !name.grounded, name.text);
  const number = acceptAnswer('The platform handled 47 retries with idempotency keys, so the money moved once.', castler.note, castler.question);
  check('rejects invented number', !number.grounded, number.text);
  const first = acceptAnswer('I built the platform with idempotency keys so a retry never moved money twice.', castler.note, castler.question);
  check('rejects first person', !first.grounded, first.text);
  const short = acceptAnswer('Yes.', castler.note, castler.question);
  check('rejects short', !short.grounded && short.text.length > 20, short.text);
  const novel = acceptAnswer('He deployed blockchain sharding with quantum kubernetes orchestration everywhere.', castler.note, castler.question);
  check('rejects novel words', !novel.grounded, novel.text);
  const twisted = acceptAnswer('The platform stopped double payments by using circuit breakers and retries.', castler.note, castler.question);
  check('rejects recombined claim', !twisted.grounded, twisted.text);
  for (const flipped of [
    'A retry was allowed to move the money twice.',
    'A retry was always allowed to move the money twice.',
    "The platform was event driven, and a retry wasn't allowed to move the money once.",
  ]) {
    const result = acceptAnswer(flipped, castler.note, castler.question);
    check(`rejects flip: ${flipped}`, !result.grounded, result.text);
  }
  const extension = planReply('Did he build a Chrome extension?');
  if (extension.kind === 'think') {
    const truncated = acceptAnswer(
      'I believe, indeed, he built a Chrome extension that records a session and writes a Playwright script, with fallback selectors.',
      extension.note,
      extension.question
    );
    check('accepts truncated clause', truncated.grounded, truncated.text);
    const kills = acceptAnswer(
      'He built a Chrome extension that records a session and writes a Playwright script, so a small DOM change does kill the run.',
      extension.note,
      extension.question
    );
    check('rejects dropped negation', !kills.grounded, kills.text);
  }
  const negated = acceptAnswer("Indeed, a retry was not allowed to move the money twice.", castler.note, castler.question);
  check('accepts kept negation', negated.grounded, negated.text);
  const thin = acceptAnswer('The platform was built.', castler.note, castler.question);
  check('rejects thin answer', !thin.grounded, thin.text);
  for (const inverted of ['A retry was not not allowed to move the money twice.', 'A retry was never allowed to move the money twice.']) {
    const result = acceptAnswer(inverted, castler.note, castler.question);
    check(`rejects ${inverted}`, !result.grounded, result.text);
  }
  const we = acceptAnswer('We built the event driven platform with idempotency keys so a retry never moved the money twice.', castler.note, castler.question);
  check('rejects we', !we.grounded, we.text);
  const enjoyed = acceptAnswer('I rather enjoyed the event driven platform, with idempotency keys so a retry never moved the money twice.', castler.note, castler.question);
  check('rejects I enjoyed', !enjoyed.grounded, enjoyed.text);
  const told = acceptAnswer('I am told the platform was event driven. A retry was not allowed to move the money twice.', castler.note, castler.question);
  check('accepts I am told', told.grounded, told.text);
}

const migration = planReply('Tell me about the MongoDB migration');
if (migration.kind === 'think') {
  const oracle = acceptAnswer(
    'Oracle was the source, I am told. He led a zero-downtime migration of about two hundred gigabytes to MySQL, with dual writes and a blue-green cutover.',
    migration.note,
    migration.question
  );
  check('rejects sentence-initial name', !oracle.grounded, oracle.text);
  const faithful = acceptAnswer(
    'Indeed. He led a zero-downtime migration of about two hundred gigabytes from MongoDB to MySQL, with dual writes and a blue-green cutover.',
    migration.note,
    migration.question
  );
  check('accepts faithful migration', faithful.grounded, faithful.text);
  for (const swapped of [
    'He led a zero-downtime migration of about two hundred terabytes from MongoDB to MySQL, with dual writes and a blue-green cutover.',
    'He led a team of about twenty-five engineers on the migration to MySQL.',
    'Queries ran forty percent of the time against MySQL after the migration.',
  ]) {
    const result = acceptAnswer(swapped, migration.note, migration.question);
    check(`rejects swapped unit: ${swapped.slice(0, 40)}`, !result.grounded, result.text);
  }
  const faster = acceptAnswer('Indeed, they made queries about forty percent faster, and cut infrastructure cost about twenty-five percent.', migration.note, migration.question);
  check('accepts faithful percentages', faster.grounded, faster.text);
  const reversed = acceptAnswer(
    'He led a zero-downtime migration of about two hundred gigabytes from MySQL to MongoDB, with dual writes and a blue-green cutover.',
    migration.note,
    migration.question
  );
  check('rejects reversed direction', !reversed.grounded, reversed.text);
  const swappedSubjects = acceptAnswer(
    'They improved consistency, cut queries about forty percent, and made infrastructure cost about twenty-five percent faster.',
    migration.note,
    migration.question
  );
  check('rejects subject swap', !swappedSubjects.grounded, swappedSubjects.text);
  const times = acceptAnswer('They improved consistency, made queries about 3x faster, and cut infrastructure cost about twenty-five percent.', migration.note, migration.question);
  check('rejects 3x', !times.grounded, times.text);
  const eighty = acceptAnswer('Queries became eighty percent faster after the migration to MySQL.', migration.note, migration.question);
  check('rejects eighty', !eighty.grounded, eighty.text);
} else {
  check('migration thinks', false, JSON.stringify(migration));
}

const scale = planReply('How many transactions at Castler?');
if (scale.kind === 'think') {
  const conflated = acceptAnswer('Above fifty million transactions a month, I am told.', scale.note, scale.question);
  check('rejects conflated metric', !conflated.grounded, conflated.text);
  const halved = acceptAnswer('More than two million transactions, and the payment path stayed under one hundred milliseconds.', scale.note, scale.question);
  check('rejects halved latency', !halved.grounded, halved.text);
  const exact = acceptAnswer('Volume was above fifty crore rupees a month, I am told, across more than two million transactions.', scale.note, scale.question);
  check('accepts exact metric', exact.grounded, `${exact.text} | ${scale.note}`);
  for (const bound of [
    'Volume was above fifty crore rupees a month, across at most two million transactions.',
    'Volume was above fifty crore rupees a month, across no more than two million transactions.',
    'Volume was above fifty crore rupees a month, across about half of two million transactions.',
    'Volume was above fifty crore rupees a month, across nearly two million transactions.',
    'Volume was at most fifty crore rupees a month.',
  ]) {
    const result = acceptAnswer(bound, scale.note, scale.question);
    check(`rejects bound: ${bound.slice(-40)}`, !result.grounded, result.text);
  }
  for (const filler of [
    'Volume was above fifty crore in transactions a month, I am told.',
    'Volume was above fifty crore of transactions a month, I am told.',
  ]) {
    const result = acceptAnswer(filler, scale.note, scale.question);
    check(`rejects filler unit: ${filler}`, !result.grounded, result.text);
  }
  const reordered = acceptAnswer('More than two million transactions a month, I am told, above fifty crore rupees.', scale.note, scale.question);
  check('rejects reordered facts', !reordered.grounded, reordered.text);
} else {
  check('scale thinks', false, JSON.stringify(scale));
}

check('third person build', thirdPerson('I build agents. I run jobs. I fix bugs. I study logs. I scaled it.') === 'He builds agents. He runs jobs. He fixes bugs. He studies logs. He scaled it.', thirdPerson('I build agents. I run jobs. I fix bugs. I study logs. I scaled it.'));
check('caller stays', fixNames('Who was the caller?') === 'Who was the caller?', fixNames('Who was the caller?'));
check('cashier stays', fixNames('the cashier and the castle') === 'the cashier and the castle', fixNames('the cashier and the castle'));
check('okay filler', cleanTranscript('Okay.') === '');

let memory = planReply('Tell me about Castler').memory;
let last = planReply('Tell me more', memory);
for (let i = 0; i < 8; i += 1) {
  last = planReply('Tell me more', memory);
  memory = last.memory;
}
check('end of beats is fixed', last.kind === 'say' && /all I have on Castler/.test(last.text), JSON.stringify(last));
const stack = planReply('What is his stack?');
const stackBefore = planReply('What came before that?', stack.memory);
check('before-empty is fixed', stackBefore.kind === 'say' && !/\bAsk him\b/.test(stackBefore.text), JSON.stringify(stackBefore));
const earliest = planReply('What came before that?', planReply('Tell me about Castler').memory);
check('earliest is said', earliest.kind === 'say' && /Castler/.test(earliest.text) && !/\bI (go|started)\b/.test(earliest.text), JSON.stringify(earliest));

const volume = planReply('How many transactions at Castler?', initialMemory());
if (volume.kind === 'think') {
  const vague = acceptAnswer('A great many, I am told, and all of them handled with care.', volume.note, volume.question);
  check('quantity needs number', !vague.grounded, vague.text);
} else {
  check('volume thinks', false, JSON.stringify(volume));
}

const wellnessNow = planReply('What does he do at WellnessLiving?');
if (wellnessNow.kind === 'think') {
  const past = acceptAnswer('He was a senior software engineer at WellnessLiving, in Bengaluru.', wellnessNow.note, wellnessNow.question);
  check('rejects tense change', !past.grounded, past.text);
  const present = acceptAnswer('Right now he is a senior software engineer at WellnessLiving, in Bengaluru.', wellnessNow.note, wellnessNow.question);
  check('accepts present role', present.grounded, present.text);
}
if (kusho.kind === 'think') {
  const current = acceptAnswer('Indeed, he is at Kusho, August 2023 to April 2025.', kusho.note, kusho.question);
  check('rejects former as current', !current.grounded, current.text);
}
const payee = planReply('What was hard about payee validation?');
if (payee.kind === 'think') {
  const cause = acceptAnswer('Peak demand was above a thousand requests a minute, so the bank API was tightly rate limited.', payee.note, payee.question);
  check('rejects invented cause', !cause.grounded, cause.text);
  const loose = acceptAnswer('Peak demand was above a thousand requests a minute, and the bank API was rate limited.', payee.note, payee.question);
  check('rejects dropped tightly', !loose.grounded, loose.text);
}
if (migration.kind === 'think') {
  const skipped = acceptAnswer(
    'He led a zero-downtime migration of about two hundred gigabytes from MongoDB to MySQL, with dual writes and a blue-green cutover. They improved consistency, made queries about forty percent faster, and cut infrastructure cost about twenty-five percent.',
    migration.note,
    migration.question
  );
  check('rejects skipped antecedent', !skipped.grounded, skipped.text);
}
for (const [question, answer] of [
  ['What was hard about payee validation?', 'He was the awkward one.'],
  ['How did he stop double payments at Castler?', 'He was not allowed to move the money twice.'],
  ['How did he stop double payments at Castler?', 'A retry was not allowed to move the money.'],
  ['What is the latency target?', 'Indeed, he is under a second, I am told.'],
  ['Tell me about the Cerebrum work', 'He is the LLM service the telephony agents call.'],
]) {
  const plan = planReply(question);
  if (plan.kind === 'think') {
    const result = acceptAnswer(answer, plan.note, plan.question);
    check('rejects swapped subject or dropped tail', !result.grounded, answer);
  }
}
const target = planReply('What is the latency target?');
if (target.kind === 'think') {
  check('accepts plain quote', acceptAnswer('The target is under a second.', target.note, target.question).grounded);
}
const redis = planReply('How did he use Redis at Kusho?');
if (redis.kind === 'think' && /instead of/.test(redis.note)) {
  const sentence = splitSentences(redis.note).find((item) => /instead of/.test(item)) ?? '';
  const flipped = acceptAnswer(sentence.replace(/instead of /, ''), redis.note, redis.question);
  check('rejects dropped instead of', !flipped.grounded, `${flipped.text} | ${sentence}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('butler qa passed');
