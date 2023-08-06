/*
  151 - Query String Parser
  -------
  by Pig Fang (@g-plane) #extreme #template-literal

  ### Question

  You're required to implement a type-level parser to parse URL query string into a object literal type.

  Some detailed requirements:

  - Value of a key in query string can be ignored but still be parsed to `true`. For example, `'key'` is without value, so the parser result is `{ key: true }`.
  - Duplicated keys must be merged into one. If there are different values with the same key, values must be merged into a tuple type.
  - When a key has only one value, that value can't be wrapped into a tuple type.
  - If values with the same key appear more than once, it must be treated as once. For example, `key=value&key=value` must be treated as `key=value` only.

  > View on GitHub: https://tsch.js.org/151
*/

/* _____________ Your Code Here _____________ */

type Include<T extends unknown[], Search> = T extends [infer Item, ...infer Rest]
  ? Search extends Item
    ? true
    : Include<Rest, Search>
  : false

type AndStrParser<
  Str extends string,
  StrArr extends unknown[] = []
> = Str extends `${infer Item}&${infer Rest}`
  ? AndStrParser<Rest, [...StrArr, Item]>
  : [...StrArr, Str]

type NormalizeArr<T extends unknown[], Result extends unknown[] = []> = T extends [
  infer Item,
  ...infer Rest
]
  ? Item extends `${infer _}=${infer _}` | ''
    ? NormalizeArr<Rest, [...Result, Item]>
    : NormalizeArr<Rest, [...Result, `${Item & string}=true`]>
  : Result

type DetermineTrueStr<T> = T extends 'true' ? true : T

type ArrParser<Arr extends unknown[] = [], Result extends Record<string, any> = {}> = Arr extends [
  infer Item,
  ...infer Rest
]
  ? Item extends `${infer Key}=${infer Val}`
    ? ArrParser<
        Rest,
        {
          [K in keyof Result | Key]: K extends Key
            ? Result[Key] extends string | true
              ? Result[Key] extends DetermineTrueStr<Val>
                ? DetermineTrueStr<Val>
                : [Result[Key], DetermineTrueStr<Val>]
              : Result[Key] extends unknown[]
              ? Include<Result[Key], DetermineTrueStr<Val>> extends true
                ? Result[Key]
                : [...Result[Key], DetermineTrueStr<Val>]
              : DetermineTrueStr<Val>
            : Result[K]
        }
      >
    : Result
  : Result

type ParseQueryString<Str extends string> = ArrParser<NormalizeArr<AndStrParser<Str>>>

/* _____________ Test Cases _____________ */
import type { Equal, Expect } from '@type-challenges/utils'

type cases = [
  Expect<Equal<ParseQueryString<''>, {}>>,
  Expect<Equal<ParseQueryString<'k1'>, { k1: true }>>,
  Expect<Equal<ParseQueryString<'k1&k1'>, { k1: true }>>,
  Expect<Equal<ParseQueryString<'k1&k2'>, { k1: true; k2: true }>>,
  Expect<Equal<ParseQueryString<'k1=v1'>, { k1: 'v1' }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k1=v2'>, { k1: ['v1', 'v2'] }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k2=v2'>, { k1: 'v1'; k2: 'v2' }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k2=v2&k1=v2'>, { k1: ['v1', 'v2']; k2: 'v2' }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k2'>, { k1: 'v1'; k2: true }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k1=v1'>, { k1: 'v1' }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k1=v2&k1=v1'>, { k1: ['v1', 'v2'] }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k2=v1&k1=v2&k1=v1'>, { k1: ['v1', 'v2']; k2: 'v1' }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k2=v2&k1=v2&k1=v3'>, { k1: ['v1', 'v2', 'v3']; k2: 'v2' }>>,
  Expect<Equal<ParseQueryString<'k1=v1&k1'>, { k1: ['v1', true] }>>,
  Expect<Equal<ParseQueryString<'k1&k1=v1'>, { k1: [true, 'v1'] }>>
]

/* _____________ Further Steps _____________ */
/*
  > Share your solutions: https://tsch.js.org/151/answer
  > View solutions: https://tsch.js.org/151/solutions
  > More Challenges: https://tsch.js.org
*/
