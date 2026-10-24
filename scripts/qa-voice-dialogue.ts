import { initialMemory, reply } from '../lib/voice/dialogue';
import { FACE_H, FACE_W, renderFace } from '../lib/voice/pixel-face';
import { buildTimeline, visemeAt } from '../lib/voice/visemes';
import type { Viseme } from '../lib/voice/types';

const failures: string[] = [];

function check(name: string, condition: boolean, detail = '') {
  if (!condition) failures.push(detail ? `${name}: ${detail}` : name);
}

function answer(input: string, memory = initialMemory()) {
  return reply(input, memory);
}

const wellness = answer('What do you do at WellnessLiving?');
check('wellness name', wellness.text.includes('WellnessLiving'), wellness.text);
check('wellness voice', /voice/i.test(wellness.text));
check('wellness year', wellness.text.includes('2025'));
check('wellness no kusho', !wellness.text.includes('Kusho'));

const qwen = answer('Tell me about the Chinese voice agent and Qwen');
check('qwen', qwen.text.includes('Qwen3') && qwen.text.includes('LiveKit') && qwen.text.includes('Gemini'), qwen.text);

const latency = answer('How do you think about latency?');
check('latency', latency.text.includes('under a second') && latency.text.includes('five stages'), latency.text);

const kusho = answer('What did you do at Kusho?');
check('kusho', kusho.text.includes('Kusho') && kusho.text.includes('2023'), kusho.text);

const playwright = answer('Did you build a Chrome extension?');
check('playwright', playwright.text.includes('Playwright') && playwright.text.includes('Chrome'), playwright.text);

const castler = answer('Tell me about Castler and payments');
check('castler', castler.text.includes('Castler') && castler.text.includes('UPI'), castler.text);

const volume = answer('How many transactions?');
check('volume', volume.text.includes('two million') && volume.text.includes('crore'), volume.text);

const migration = answer('Tell me about the MongoDB migration');
check('migration', migration.text.includes('MongoDB') && migration.text.includes('MySQL') && migration.text.includes('downtime'), migration.text);

const weather = answer('What is the weather in Paris?');
check('unknown', weather.text.includes('WellnessLiving') && weather.text.includes('Kusho') && !/google|meta|openai/i.test(weather.text), weather.text);

const hello = answer('hey who are you');
check('hello', hello.text.includes('Harsh') && hello.text.includes('WellnessLiving'), hello.text);

let memory = initialMemory();
const first = reply('Tell me about WellnessLiving', memory);
memory = first.memory;
const second = reply('tell me more', memory);
check('more changes', first.text !== second.text, `${first.text} || ${second.text}`);
check('more stays', second.memory.lastTopic === 'wellness');

const before = reply('before that', second.memory);
check('before kusho', before.text.includes('Kusho'), before.text);

const compare = answer('Compare WellnessLiving and Castler');
check('compare', compare.text.includes('WellnessLiving') && compare.text.includes('Castler') && compare.text.includes('Kusho'), compare.text);

const oauth = answer('How did you use OAuth?');
check('oauth', oauth.text.includes('PKCE') && oauth.text.includes('WebSocket'), oauth.text);

const beforeKusho = answer('what came before kusho?');
check('before kusho is castler', beforeKusho.text.includes('Castler') && !beforeKusho.text.includes('Kusho'), beforeKusho.text);

const beforeWellness = answer('what did you do before wellnessliving');
check('before wellness is kusho', beforeWellness.text.includes('Kusho') && beforeWellness.text.includes('tooling'), beforeWellness.text);

const kafkaAtCastler = answer('tell me about kafka at castler');
check('kafka stays on castler', kafkaAtCastler.text.includes('Castler') && !kafkaAtCastler.text.includes('Cerebrum'), kafkaAtCastler.text);

const redisAtCastler = answer('how did you use redis at castler');
check('redis stays on castler', redisAtCastler.text.includes('Castler') && !redisAtCastler.text.includes('RQ'), redisAtCastler.text);

let authMemory = initialMemory();
const pkce = reply('pkce', authMemory);
authMemory = pkce.memory;
const afterPkce = reply('before that', authMemory);
check('pkce is castler', pkce.text.includes('PKCE') && pkce.text.includes('Castler'), pkce.text);
check('before pkce is not kusho', !afterPkce.text.includes('Kusho'), afterPkce.text);

check('no team fiction', !/team of \d+/i.test([wellness, kusho, castler, migration].map((item) => item.text).join(' ')));

const timeline = buildTimeline('I build voice systems for live calls.', 1);
check('timeline', timeline.spans.length > 3 && timeline.duration > 400, String(timeline.duration));
check('timeline start', visemeAt(timeline, 0) !== 'rest' || timeline.spans[0].viseme !== 'rest');
check('timeline end', visemeAt(timeline, timeline.duration + 20) === 'rest');

function cavityCount(viseme: Viseme) {
  const frame = renderFace({ viseme, blink: 0, listen: 0, look: 0 });
  let count = 0;
  let opaque = 0;
  for (let i = 0; i < frame.rgba.length; i += 4) {
    if (frame.rgba[i + 3] === 0) continue;
    opaque += 1;
    if (frame.rgba[i] === 3 && frame.rgba[i + 1] === 7 && frame.rgba[i + 2] === 8) count += 1;
  }
  return { count, opaque };
}

const rest = cavityCount('rest');
const ah = cavityCount('ah');
const mbp = cavityCount('mbp');
const ee = cavityCount('ee');
const oh = cavityCount('oh');
check('face opaque', rest.opaque > 400 && rest.opaque < FACE_W * FACE_H, String(rest.opaque));
check('corner empty', renderFace({ viseme: 'rest', blink: 0, listen: 0, look: 0 }).rgba[3] === 0);
check('rest mouth', rest.count > 0, String(rest.count));
check('ah wider', ah.count > rest.count + 4, `ah ${ah.count} rest ${rest.count}`);
check('ee mouth', ee.count > 0, String(ee.count));
check('oh mouth', oh.count > rest.count, `oh ${oh.count} rest ${rest.count}`);
check('mbp closed', mbp.count === 0, String(mbp.count));

const blinked = renderFace({ viseme: 'rest', blink: 1, listen: 0, look: 0 });
let pupilsOpen = 0;
let pupilsShut = 0;
const open = renderFace({ viseme: 'rest', blink: 0, listen: 0, look: 0 });
for (let i = 0; i < open.rgba.length; i += 4) {
  if (open.rgba[i] === 1 && open.rgba[i + 1] === 4 && open.rgba[i + 2] === 6) pupilsOpen += 1;
  if (blinked.rgba[i] === 1 && blinked.rgba[i + 1] === 4 && blinked.rgba[i + 2] === 6) pupilsShut += 1;
}
check('two eyes', pupilsOpen >= 4, String(pupilsOpen));
check('blink closes', pupilsShut < pupilsOpen, `open ${pupilsOpen} shut ${pupilsShut}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('voice qa passed', { rest: rest.count, ah: ah.count, ee: ee.count, oh: oh.count, pupils: pupilsOpen, opaque: rest.opaque, height: FACE_H });
