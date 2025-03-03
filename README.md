# Zoopipe

Zoopipe aims to acheive the same benefits of the pipe operator from functional programming, but with a fluent class-based API.

## But why?

The biggest reason is simplified typing. Whereas the type signature of traditional pipe function in Typescript grows more horrifyingly verbose for every function in the pipe, the type of a Zoopipe is simply `Pipe<T>` at every step of the way, where `T` is the type of its current value. Furthermore, there is no arbitrary limit on the number of functions that can be piped together in Zoopipe, unlike traditional pipe operators, which can have only as many functions as the author created signatures for.

For the simplest use cases, Zoopipe may be a bit more verbose than traditional alternatives. But the more complex the pipe, the greater Zoopipe's potential to improve developer experience, especially with the convenience methods such as `ifElse`.

## Installation

```
npm install zoopipe
```

## Basic Usage

`pipe` is a factory function that returns an instance of the `Pipe` class.

```ts
import { pipe } from `zoopipe`;

const double = (x: number) => x * 2;

const result = pipe(5)
                 .then(double)        // 10 (still a pipe)
                 .then(double)        // 20 (still a pipe)
                 .finally(double);    // 40 (now just a number)

```

Notice that the last operation in the pipe uses `finally` rather than `then`. This signals the pipe to return the final unboxed output rather than another pipe.

## Convenience Functions

Because operations will often be performed conditionally, there are convenience methods to improve the readability of conditionally applied operations. In the `if` method, the condition may be either a function with a boolean output, or a constant. The constant is a shortcut for a function that tests for equality, which is checked using `===`. The result can also be a constant, where `CONSTANT` is equivalent to `() => CONSTANT`.

```ts
import { pipe } from `zoopipe`;

const double = (x: number) => x * 2;
const addOne = (x: number) => x + 1;

const a = pipe(5).if(Number.isInteger, double).finally(addOne);         // 5 * 2 + 1 = 11
const b = pipe(5.5).if(Number.isInteger, double).finally(addOne);       // 5.5 + 1 = 6.5  (doubling not performed since 5.5 isn't integer)

// if(5, ) is a shortcut for if(x => x === 5, )
const c = pipe(5).if(5, double).finally(addOne);                        // 5 * 2 + 1 = 11
const d = pipe(6).if(5, double).finally(addOne);                        // 6 + 1 = 7      (doubling not performed since 6 !== 5)

// if( ,5) is a shortcut for if(  , () => 5)
const e =  pipe(5).if(5, 0).finally(addOne);                            // 0 + 1 = 1
const f =  pipe(6).if(5, 0).finally(addOne);                            // 6 + 1 = 7

```

If the conditional operation is the last operation, use the `finallyIf` method instead.

```ts
const isPositive = (x) => x > 0;

const a = pipe(5).then(addOne).finallyIf(10, double); // 5 + 1 = 6
const b = pipe(10).then(addOne).finallyIf(10, double); // (9 + 1) * 2 = 20
const c = pipe(10)
  .then(addOne)
  .finallyIf<number>(isPositive, -100); // -100 since 10 + 1 > 0
const d = pipe(-10)
  .then(addOne)
  .finallyIf<number>(isPositive), -100); // -9 since -10 + 1 = -9 is not > 0
```

The `ifNot` and its counterpart `finallyIfNot` works similarly.

```ts
const a = pipe(5).ifNot(Number.isInteger, double).finally(addOne); // 5 + 1 = 6
const b = pipe(5.5).ifNot(Number.isInteger, double).finally(addOne); // 5.5 * 2 + 1 = 12
const c = pipe(5).then(addOne).finallyIfNot(5, double); // (5 + 1) * 2 = 12 since 6 !== 5
const d = pipe(4).then(addOne).finallyIfNot(5, 0); // 0 since 4 + 1 = 5
```

There are also `ifElse` and `finallyIfElse`. All three parameters can be functions or constants, as with the other functions.

```ts
// ifElse(condition, result if true, result if false)
const a = pipe(5).ifElse(isPositive, double, 100).finally(addOne); // 5 * 2 + 1 = 11
const b = pipe(-5).ifElse(isPositive, double, 100).finally(addOne); // 100 + 1 = 101
const c = pipe(5).then(addOne).finallyIfElse(isPositive, 100, double); // 100 since 6 is positive
const d = pipe(-5).then(addOne).finallyIfElse(isPositive, 100, double); // -4 * 2 = -8 since -4 is not positive
const e = pipe(5).then(addOne).finallyIfElse(10, double, addOne); // (5 + 1) * 2 = 12 since 6 !== 10
const f = pipe(9).then(addOne).finallyIfElse(10, double, addOne); // (9 + 1) + 1 = 11 since 9 + 1 = 10
```

## Debugging

You can use the `inspect` method to view the result of a pipe at an intermediate step.

```
const a = pipe(5).then(double).inspect().finally(double);     // prints 10 to the console
                                                              // a will be 20

```

## Type Inference

Type inference usually works pretty well with Zoopipe, but you can always add annotations if needed or desired.

```ts
const a: number[] = pipe<string>("zoo")
  .then<number>((x) => x.length)
  .finally<number[]>((x) => [x]); // [3]
```
