import { events } from 'sveltekit-sse';
import type { RequestHandler } from './$types';

const delay = (millis: number) => new Promise((r) => setTimeout(r, millis));

export const GET: RequestHandler = async ({ url }) => {
	console.log('url', url);
	let query = url.pathname.split('/');
	let code = query[1];

	let quiz = await getQuiz(code);
	let stop = false;
	let details = {
		rounds: quiz.rounds,
		time: quiz.time
	};
	let breakTime = 4000;
	let time = 0;

	return events(async (emit) => {
		let start = false;
		emit('details', JSON.stringify(details));
		while (!stop) {
			emit('time', `${Date.now()}`);
			if (!start) {
				start = await hostCheck(code);
				time = Date.now() + 500;
			} else {
				let round = Math.floor((Date.now() - time) / (1000 * (quiz.time + breakTime)));
				if (round >= quiz.rounds) {
					stop = true;
				} else if (round >= 0) {
					let question = quiz.questions[round];
					question.round = round;
					emit('question', JSON.stringify(question));
				}
			}
			emit('event-1', `/events (1) says: ${Date.now()}`);
			await delay(500);
		}
	}).toResponse();
};
