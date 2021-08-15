export class Right<T> {
  public readonly type = 'RIGHT';
  static of<T>(value: T): Right<T> {
    return new Right(value)
  }

  constructor(public readonly value: T) {}

  isRight(): this is Right<T> {
    return true;
  }

  map<K>(fn: (value: T) => K) {
    return Right.of(fn(this.value));
  }

  chain = <K,E> (fn: ChainFn<T,K,E>): MaybeAsyncEither<K, E> => {
    return fn(this.value);
  }

  isLeft(): boolean {
    return false;
  }
  
  unwrap(right: (value: T) => void) {
    return right(this.value);
  }
}

export class Left<E> {
  public readonly type = 'LEFT';

  static of<E>(error: E): Left<E> {
    return new Left(error )
  }

  constructor(public readonly error: E) {}

  map<T, K>(fn: (value: T) => K) {
    return this;
  }

  chain = <T,K> (fn: ChainFn<T,K,E>) => {
    return this;
  }

  isLeft(): this is Left<E> {
    return true;
  }

  isRight(): boolean {
    return false;
  }

  unwrap(left: (error: E) => void) {
    return left(this.error);
  }
}


export type Either<T, E> = Right<T> | Left<E>;
export type AsyncEither<T, E> = Promise<Either<T, E>>;
export type MaybeAsyncEither<T, E> = Either<T, E> | AsyncEither<T, E>

const isTaskEither = <T, E>(e: MaybeAsyncEither<T, E>): e is AsyncEither<T, E> => 
    e instanceof Promise;

const isNotTaskEither = <T, E>(e: MaybeAsyncEither<T, E>): e is Either<T, E> => 
    !(e instanceof Promise);
  
const map = <T,K,E> (fn: (value: T) => K) => (e: Either<T, E>): Either<K, E> => 
    e.isLeft() ? e : e.map(fn);

export type ChainFn<T,K,E> = (value: T) => MaybeAsyncEither<K, E>

const chain = <T,K,E> (fn: ChainFn<T,K,E>) => async (e: MaybeAsyncEither<T, E>) => {
  const applyChain = (e: Either<T, E>) => e.isLeft() ? e.chain(fn) : e.chain(fn);
  return isTaskEither(e) ? e.then(applyChain) : applyChain(e);
}

const unwrap = <E, T>(right: (value: T) => void, left: (error: E) => void) => async (e: MaybeAsyncEither<T, E>) => {
  const unwrap = (e: Either<T, E>) => e.isLeft() ? e.unwrap(left) : e.unwrap(right)
  return isTaskEither(e) ? e.then(unwrap) : unwrap(e)
}

const from = <T,K,E>(
  tryFn: (value: T) => K | Promise<K>, 
  onFailure: (err?: any) => E,
) => async (value: T): AsyncEither<K, E> => {
  try {
    return Right.of(await tryFn(value));
  } catch (err) {
    return Left.of(onFailure(err));
  }
}

export const Either = {
  map,
  chain,
  unwrap,
  isTaskEither,
  isNotTaskEither,
  from,
}
