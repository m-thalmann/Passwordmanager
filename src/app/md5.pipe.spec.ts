import { Md5Pipe } from './md5.pipe';

describe('Md5Pipe', () => {
  it('create an instance', () => {
    const pipe = new Md5Pipe();
    expect(pipe).toBeTruthy();
  });
});
