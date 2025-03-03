type Fn<I, O> = (x: I) => O;
type FnOrConst<I, O> = O | Fn<I, O>;
type Predicate<I> = (x: I) => boolean;
type PredicateOrConst<I> = I | Predicate<I>;

class Pipe<T> {
  constructor(private value: T) {}

  private doTransform<U>(transform: FnOrConst<T, U>): U {
    return transform instanceof Function ? transform(this.value!) : transform;
  }

  private conditionPasses(condition: PredicateOrConst<T>) {
    return condition instanceof Function
      ? condition(this.value)
      : condition === this.value;
  }

  inspect(): Pipe<T> {
    console.log(this.value);
    return this;
  }

  then<U>(transform: FnOrConst<T, U>): Pipe<U> {
    return new Pipe(this.doTransform(transform));
  }

  finally<U>(transform: FnOrConst<T, U>): U {
    return this.doTransform(transform);
  }

  // <U extends T extends U ? unknown : never> ensures U is a supertype of T.

  if<U extends T extends U ? unknown : never>(
    condition: PredicateOrConst<T>,
    transform: FnOrConst<T, U>
  ): Pipe<U> {
    return this.conditionPasses(condition)
      ? new Pipe(this.doTransform(transform))
      : (this as unknown as Pipe<U>);
  }

  ifNot<U extends T extends U ? unknown : never>(
    condition: PredicateOrConst<T>,
    transform: FnOrConst<T, U>
  ): Pipe<U> {
    return this.conditionPasses(condition)
      ? (this as unknown as Pipe<U>)
      : new Pipe(this.doTransform(transform));
  }

  ifElse<U>(
    condition: PredicateOrConst<T>,
    ifTransform: FnOrConst<T, U>,
    elseTransform: FnOrConst<T, U>
  ): Pipe<U> {
    const result = this.conditionPasses(condition)
      ? this.doTransform(ifTransform)
      : this.doTransform(elseTransform);
    return new Pipe(result);
  }

  finallyIf<U extends T extends U ? unknown : never>(
    condition: PredicateOrConst<T>,
    transform: FnOrConst<T, U>
  ): U {
    return this.conditionPasses(condition)
      ? this.doTransform(transform)
      : (this.value as unknown as U);
  }

  finallyIfNot<U extends T extends U ? unknown : never>(
    condition: PredicateOrConst<T>,
    transform: FnOrConst<T, U>
  ): U {
    return this.conditionPasses(condition)
      ? (this.value as unknown as U)
      : this.doTransform(transform);
  }

  finallyIfElse<U>(
    condition: PredicateOrConst<T>,
    ifTransform: FnOrConst<T, U>,
    elseTransform: FnOrConst<T, U>
  ): U {
    return this.conditionPasses(condition)
      ? this.doTransform(ifTransform)
      : this.doTransform(elseTransform);
  }
}

export function pipe<T>(value: T): Pipe<T> {
  return new Pipe<T>(value);
}
