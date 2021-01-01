import test from 'ava';

const fn = () => 'foo';

test('mock test for first running', t => {
	t.is(fn(), 'foo');
});