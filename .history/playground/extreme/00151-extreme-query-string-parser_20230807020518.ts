/* eslint-disable @typescript-eslint/comma-dangle */
/* eslint-disable @typescript-eslint/indent */
/*
  151 - Query String Parser
  -------
  by Pig Fang (@g-plane) #地狱 #template-literal

  ### 题目

  You're required to implement a type-level parser to parse URL query string into a object literal type.

  Some detailed requirements:

  - Value of a key in query string can be ignored but still be parsed to `true`. For example, `'key'` is without value, so the parser result is `{ key: true }`.
  - Duplicated keys must be merged into one. If there are different values with the same key, values must be merged into a tuple type.
  - When a key has only one value, that value can't be wrapped into a tuple type.
  - If values with the same key appear more than once, it must be treated as once. For example, `key=value&key=value` must be treated as `key=value` only.

  > 在 Github 上查看：https://tsch.js.org/151/zh-CN
*/

/* _____________ 你的代码 _____________ */

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

type ParseTrueStr<T> = T extends 'true' ? true : T

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
              ? Result[Key] extends ParseTrueStr<Val>
                ? ParseTrueStr<Val>
                : [Result[Key], ParseTrueStr<Val>]
              : Result[Key] extends unknown[]
              ? Include<Result[Key], ParseTrueStr<Val>> extends true
                ? Result[Key]
                : [...Result[Key], ParseTrueStr<Val>]
              : ParseTrueStr<Val>
            : Result[K]
        }
      >
    : Result
  : Result

type ParseQueryString<Str extends string> = ArrParser<NormalizeArr<AndStrParser<Str>>>

// type a = ParseQueryString<'dsf&1&2'>
/* _____________ 测试用例 _____________ */
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

/* _____________ 下一步 _____________ */
/*
  > 分享你的解答：https://tsch.js.org/151/answer/zh-CN
  > 查看解答：https://tsch.js.org/151/solutions
  > 更多题目：https://tsch.js.org/zh-CN
*/
