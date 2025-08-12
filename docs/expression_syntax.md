---
sidebar_position: 3
---

import InlineCode from '@site/src/components/InlineCode';

# Expression Syntax

Whenever specifying placeholders, binding variables, using intrinsic expression-attributes or binding dynamic values to the attributes of tags, expressions are the means via which to describe the value used; they can be as simple as accessing a variable, stringing data together or computing a numeric value and may become as nuanced as using boolean logic, providing fallback-values or accessing members of a variable.

## String Literals

A string represents a sequence of characters as-is, to be used in expressions; their contents are delimited by single-quotes (`'`) or, alternatively, double-quotes (`"`).

```markup-expression
'this is a string-literal'
```

In order to include a literal single-quote, prepend it by a backslash (`\`) in order to avoid premature string termination.

```markup-expression
'containing a \' single quote'
```

:::tip
When specifying string-literals inside of attribute-values which themselves use string-notation delimited by a double-quote (`"`), said double-quotes are to be marked by a preceding backslash (`\`) in order to avoid premature attribute-value termination.

```component-markup
<my-tag [my-attribute]="'my string literal containing a \" double-quote'">
```
:::

## Numbers

Numeric values are always expressed using the decimal system, i.e. digits `0` through `9`.

```markup-expression
8912
```

Fractional values may be depicted using the decimal-dot (`.`).

```markup-expression
2.7182
```

Where the leading zero can be dropped entirely:

```markup-expression
.5
```

Additionally, numbers may become negative simply by prepending a minus-sign (`-`).

```markup-expression
-512
```


```markup-expression
-.23
```

## Concatenation Operator

Due to this syntax being dynamically typed, the addition-operator (`+`) cannot reliably be overloaded to concatenate values back-to-back into a resulting string; thus, the ampersand (`&`) is used to denote this intent.


Assuming that `l-me: a` holds `l-me: 'Hello'` and `l-me: b` holds `l-me: 'World'`, the expression

```markup-expression
a & ', ' & b & '!'
```

will result in

```markup-expression
'Hello, World!'
```

## String-Interpolation

As the concatenation-operator `&` tends to clutter the expression whenever multi-part strings are built, string-interpolation poses an elegant alternative, increasing readability.

Instead of writing

```markup-expression
'a ' & b & ' c ' & d & ' e'
```

one may simply employ the template-literal, which works analogous to strings, just that it uses backticks (`` ` ``) as quotes and enables interpolation-syntax analogous to how it can be used all throughout markup plain-text:

```markup-expression
`a {b} c {d} e`
```

Interpolations may be nested to any arbitrary depth, whenever necessary (the following example is just for shows and would never make sense in the field):

```markup-expression
`a {b} c {`hello {d} world`} e`
```

In order to have literal curly-brackets be contained in a template-literal, simply prepend them by a backslash, as follows:

```markup-expression
`a \{ {b} c {d} \} e`
```

## Mathematical Operators

The following mathematical operators are available when formulae are to be expressed. The operator of highest precedence will be evaluated first - use parentheses when necessary.

| Operation      | Operator      | Precedence |
|:--------------:|:-------------:|:----------:|
| Addition       | `l-me: a + b` | 1          |
| Subtraction    | `l-me: a - b` | 1          |
| Multiplication | `l-me: a * b` | 2          |
| Division       | `l-me: a / b` | 2          |
| Modulo         | `l-me: a % b` | 2          |
| Exponentiation | `l-me: a ^ b` | 3          |

## Numeric Operators

Due to the fact that the precision of numbers is widened as required, multiplying a long (whole number) by a double (fractional number) will convert the former to the latter and thus result in a fractional value. When working with literal values, like `l-me: 5` and `l-me: 2`, one can always force fractional evaluation by adding a simple `.0` to one of the two operands, as in `l-me: 5 / 2.0` - now, the result will become `l-me: 2.5` instead of `l-me: 2`. If both operands are represented by variables or other complex expressions though, this little trick will not be applicable: that's when one must employ the following numeric operators.

### To Long

Converts a fractional number to a whole number by disregarding its fractional part, while passing whole numbers through untouched; let's assume that `l-me: x` holds `l-me: 5.3`, then

```markup-expression
long(x)
```

will result in `l-me: 5`.

### To Double

Converts a whole number to a fractional number by introducing a zero-valued fractional part, while passing fractional numbers through untouched; let's assume that `l-me: x` holds `l-me: 5`, then

```markup-expression
double(x)
```

will result in `l-me: 5.0`.

### Utilities

#### Round

Rounds any given number to the nearest whole value, meaning that a fractional part of greater than or equal to one-half will round up, while everything else will round down; passes whole numbers through untouched; let's assume that `l-me: x` holds `l-me: 5.4`, then

```markup-expression
round(x)
```

will result in `l-me: 5.0`, while a value of `l-me: 5.5` would result in `l-me: 6.0`.

#### Floor

Sets the fractional part of any number to zero, effectively disregarding it; passes whole numbers through untouched; let's assume that `l-me: x` holds `l-me: 5.5`, then

```markup-expression
floor(x)
```

will result in `l-me: 5.0`.

#### Ceil

Sets the fractional part of any number to zero, effectively disregarding it, and increments its whole part by one if the fractional part was non-zero; passes whole numbers through untouched; let's assume that `l-me: x` holds `l-me: 5.1`, then

```markup-expression
ceil(x)
```

will result in `l-me: 6.0`.

#### Min

Yields the smallest value of a number of provided inputs, where individual values are comma-separated.

```markup-expression
min(4, -2, 5, 3, -1)
```

The above will result in `l-me: -2`.

#### Max

Yields the largest value of a number of provided inputs, where individual values are comma-separated.

```markup-expression
max(4, -2, 5, 3, -1)
```

The above will result in `l-me: 5`.

#### Sum

Sums up all provided inputs, where individual values are comma-separated.

```markup-expression
sum(8, 21, 4, 3, 3, 5, 8, 2)
```

The above will result in `l-me: 54.0`.

#### Avg

Calculates the level term, also known as average, of all provided inputs, where individual values are comma-separated.

```markup-expression
avg(8, 21, 4, 3, 3, 5, 8, 2)
```

The above will result in `l-me: 6.75`.

## String Transformation

The following transformations may come in handy when dealing with strings of characters that are to be normalised in one form or another; operators are chainable, allowing to combine effects. Let's assume an input of `l-me: value` being `l-me: ' Hellö wöRLd '`.

| Operation     | Operator               | Result                  |
|:-------------:|:----------------------:|:-----------------------:|
| Uppercase     | `l-me: upper(value)`   | `l-me: ' HELLÖ WÖRLD '` |
| Lowercase     | `l-me: lower(value)`   | `l-me: ' hellö wörld '` |
| Titlecase     | `l-me: title(value)`   | `l-me: ' Hellö Wörld '` |
| Toggle Casing | `l-me: toggle(value)`  | `l-me: ' hELLÖ WÖrlD '` |
| Slugify       | `l-me: slugify(value)` | `l-me: ' hellö-wörld '` |
| Asciify       | `l-me: asciify(value)` | `l-me: ' Hello woRLd '` |
| Trim          | `l-me: trim(value)`    | `l-me: 'Hellö WöRLd'`   |
| Reverse       | `l-me: reverse(value)` | `l-me: 'dLRöW ölleH'`   |

In order to asciify, slugify and trim, use `l-me: asciify(slugify(trim(value)))`, which is resulting in `l-me: 'hello-world'`.

## Immediate Array

Whenever static array of items are to be instantiated for further use, simply specify the desired items in a comma-separated (`,`) list, enclosed by square brackets (`l-me: []`).

```markup-expression
['first', 'second', 'third']
```

This notation may especially come in handy when combined with the intrinsic `*for`-attribute:

```!component-markup
<red
  *for-word="['first', 'second', 'third']"
  *for-separator={<br/>}
>Hello, {word}!
```

Items may also once again be lists themselves, allowing for a tuple-style dataset.

```markup-expression
[['apple', 'red'], ['banana', 'yellow']]
```

And thereby give rise to more advanced concepts of templating.

```!component-markup
<style
  *for-item="[['apple', 'red'], ['banana', 'yellow'], ['berry', 'blue']]"
  *for-separator={<br/>}
  [color]="item[1]"
>Hello, {item[0]}!
```

## Immediate Map

Whenever static maps of key-value pairs are to be instantiated for further use, simply specify the desired items in a comma-separated (`,`) list, enclosed by curly brackets (`l-me: {}`). If the value of a key is to be equal the value of a variable of the same name, said value may be omitted.

```markup-expression
{ first: 5, second: "hello", third }
```

Analogous to immediate arrays, immediate maps may also be combined with the intrinsic `*for`-attribute, where loops will always iterate the keys of maps, as follows:

```!component-markup
<style
  *let-veggies="{carrot: 'gold', celery: 'green', tomato: 'red'}"
  *for-veggy="veggies"
  *for-separator={<br/>}
  [color]="veggies[veggy]"
>Hello, {veggy}!
```


## Range Operator

In order to quickly generate a list containing a subsequent sequence of numbers, the range operator may be used, with both bounds being *inclusive*.

```markup-expression
1..10
```

is thereby equivalent to

```markup-expression
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

This operator may especially come in handy when combined with the intrinsic `*for-` attribute.

```!component-markup
<aqua
  *for-number="1..3"
  *for-separator={<br/>}
>Hello, {number}!
```

## Substring Operator

A substring represents a sub-sequence of characters within another string; it may span only a single character, a few or up to the whole input, based on the colon-separated (`:`) start- and end-indices, which are **both inclusive** and **start at 0**.

Given an `l-me: input` of `l-me: 'ABCDEFGHIJ'` with the following indices

<table style={{textAlign: 'center'}}>
  <tbody>
    <tr>
      <th>Negative Index</th>
      <td>`l-me: -10`</td>
      <td>`l-me: -9`</td>
      <td>`l-me: -8`</td>
      <td>`l-me: -7`</td>
      <td>`l-me: -6`</td>
      <td>`l-me: -5`</td>
      <td>`l-me: -4`</td>
      <td>`l-me: -3`</td>
      <td>`l-me: -2`</td>
      <td>`l-me: -1`</td>
    </tr>
    <tr>
      <th>Positive Index</th>
      <td>`l-me: 0`</td>
      <td>`l-me: 1`</td>
      <td>`l-me: 2`</td>
      <td>`l-me: 3`</td>
      <td>`l-me: 4`</td>
      <td>`l-me: 5`</td>
      <td>`l-me: 6`</td>
      <td>`l-me: 7`</td>
      <td>`l-me: 8`</td>
      <td>`l-me: 9`</td>
    </tr>
    <tr>
      <th>Letter</th>
      <td>`l-me: 'A'`</td>
      <td>`l-me: 'B'`</td>
      <td>`l-me: 'C'`</td>
      <td>`l-me: 'D'`</td>
      <td>`l-me: 'E'`</td>
      <td>`l-me: 'F'`</td>
      <td>`l-me: 'G'`</td>
      <td>`l-me: 'H'`</td>
      <td>`l-me: 'I'`</td>
      <td>`l-me: 'J'`</td>
    </tr>
  </tbody>
</table>

Whenever indices are negative, they simply wrap around the very beginning at `l-me: 0`, counting characters back-to-start; this may be useful to operate on strings of unknown length. Next up, instead of numeric indices, strings marking positions within the input may also be provided - if they do not occur, the fallback used is either the first- or last character-index, for start and end respectively.

Let's look at some example-operations:

| Operation | Result |
|:---------:|:------:|
| `l-me: input[:]`<br/>`l-me: input[:9]`<br/>`l-me: input[0:]`<br/>`l-me: input[0:9]` | `l-me: 'ABCDEFGHIJ'` |
| `l-me: input[:5]` | `l-me: 'ABCDEF'` |
| `l-me: input[3:6]` | `l-me: 'DEFG'` |
| `l-me: input[0:3]` | `l-me: 'ABCD'` |
| `l-me: input[-2:]` | `l-me: 'IJ'` |
| `l-me: input[-5:-2]` | `l-me: 'FGHI'` |
| `l-me: input['G':]` | `l-me: 'GHIJ'` |
| `l-me: input[:'E']` | `l-me: 'ABCDE'` |
| `l-me: input[-4:'I']` | `l-me: 'GHI'` |

## String-Split Operator

Whenever a sequence of characters is to be split up into sub-sequences based on a pattern of delimiters, the string-split operator can be used to do so. Let's assume an `l-me: input` of `l-me: 'hello_world test1-test2'` and firstly focus on separators that are either `l-me: null` or empty - they split each single character up, such that `l-me: input split null` and `l-me: input split ''` both yield:

```markup-expression
[
  'h', 'e', 'l', 'l', 'o', '_', 'w', 'o', 'r', 'l', 'd', ' ',
  't', 'e', 's', 't', '1', '-', 't', 'e', 's', 't', '2'
]
```
Specifying delimiters will yield the according sub-sequences:

| Operation           | Result                                 |
|:-------------------:|:--------------------------------------:|
| `l-me: input split '_'` | `l-me: ['hello', 'world test1-test2']` |
| `l-me: input split '-'` | `l-me: ['hello_world test1', 'test2']` |
| `l-me: input split ' '` | `l-me: ['hello_world', 'test1-test2']` |

In order to make use of regular expressions to split on a pattern of delimiters, simply specify the operator `rsplit` (regex-split) instead:

```markup-expression
input rsplit '[-_ ]'
```

will yield

```markup-expression
['hello', 'world', 'test1', 'test2']
```

## Repeat Operator

Whenever a sequence of characters is to be repeated a certain number of times by simply joining it back-to-back with itself, the repeat-operator allows to depict such behaviour. Let's assume an `l-me: input` of `l-me: 'abc'`, then the following output-table applies:

| Operation | Result                             |
|:---------:|:----------------------------------:|
| `l-me: input ** 1` | `l-me: 'abc'`             |
| `l-me: input ** 2` | `l-me: 'abcabc'`          |
| `l-me: input ** 5` | `l-me: 'abcabcabcabcabc'` |

This operator may especially come in handy when generating spacers.

```!component-markup
<st><&8>{' ' ** 15}</st><br/>
<&b>Hello, world!<br/>
<st><&8>{' ' ** 15}
```

## Literals

Literals are reserved names, not able to be used as variables, holding a static value:

* Boolean value of 1, i.e. "yes": `l-me: true`
* Boolean value of 0, i.e. "no": `l-me: false`
* The absence of a value: `l-me: null`

## Accessing Variables

All variables used in expressions adhere to the convention of `l-me: snake_case` and simply by specifying their name, their corresponding value will be substituted at the stage of evaluation.

```markup-expression
my_variable
```

## Accessing Members

Variables are not required to hold mere scalar values, e.g. numbers, booleans, strings, etc., but may just as well be lists containing multiple items, maps containing multiple key-value pairs, or objects which contain named fields.

### List-Items

Assuming that `l-me: my_list` is a collection of individual items, say `l-me: 'first'`, `l-me: 'second'` and `l-me: 'third'`, their indices are simply represented by an ascending numeric index starting at zero. The index may be derived by the value of a variable, interpreted as a number.

```markup-expression
my_list[my_index]
```

| my_index  | Result           |
|:---------:|:----------------:|
| `l-me: 0` | `l-me: 'first'`  |
| `l-me: 1` | `l-me: 'second'` |
| `l-me: 2` | `l-me: 'third'`  |
| `l-me: 3` | `l-me: null`     |

Indices can also be specified immediately, with

```markup-expression
my_list[0]
```

resulting in `l-me: 'first'`.

Analogous to bounds on substrings, list-indices may also be negative, meaning that they access elements relative to the back of the sequence, with `l-me: -1` being the last, `l-me: -2` the second to last, etc.

| my_index   | Result           |
|:----------:|:----------------:|
| `l-me: -1` | `l-me: 'third'`  |
| `l-me: -2` | `l-me: 'second'` |
| `l-me: -3` | `l-me: 'first'`  |
| `l-me: -4` | `l-me: null`     |

### Map-Values

Assuming that `l-me: my_map` is assigning keys representing usernames to values being their statistics, say `l-me: 'Notch'` -> `l-me: 384`, `l-me: 'Steve'` -> `l-me: 247` and `l-me: 'Alex'` -> `l-me: 412`, the value of each such key may be accessed by specifying it analogously to numeric indices on lists.

```markup-expression
my_map[my_key]
```

| my_key             | Result       |
|:------------------:|:------------:|
| `l-me: 'Notch'`    | `l-me: 384`  |
| `l-me: 'Steve'`    | `l-me: 247`  |
| `l-me: 'Alex'`     | `l-me: 412`  |
| `l-me: 'Herobrine'`| `l-me: null` |

Keys may also be specified immediately, with

```markup-expression
my_map['Alex']
```

resulting in `l-me: 412`.

### Object-properties

Assuming that `l-me: my_object` is a Java-object containing a few members, say 

```js
{ effect: 'Regeneration', duration_ticks: 900, amplitude: 2 }
```

the value of each member may be accessed by appending a dot (`.`), followed by its name.

```markup-expression
my_object.my_member
```

| Expression                      | Result                 |
|:-------------------------------:|:----------------------:|
| `l-me: my_object.effect`        | `l-me: 'Regeneration'` |
| `l-me: my_object.duration_ticks`| `l-me: 900`            |
| `l-me: my_object.amplitude`     | `l-me: 2`              |

Analogously to maps, keys may also be specified dynamically, with

```markup-expression
my_object[my_member_name]
```

or even immediately, using

```markup-expression
my_object['duration_ticks']
```

resulting in `l-me: 900`.

:::info
When programming in Java, the established naming-convention regarding properties is `camelCase`; as to avoid programmers from being forced to employ `snake_case` on objects they want to make accessible within templates, name-conversion occurs automatically, e.g. `myExampleVariable` becomes `my_example_variable`.
:::

## Boolean Logic

### Not (Invert)

By prepending an expression with the `not` operator, it's value is interpreted as a boolean and will be inverted, meaning that `l-me: true` will become `l-me: false` and vice-versa.

```markup-expression
not value
```

| value         | Result        |
|:-------------:|:-------------:|
| `l-me: false` | `l-me: true`  |
| `l-me: true`  | `l-me: false` |

### Or (Disjunction)

By stringing two expressions together using the `or` operator, both the left- and the right hand side will be interpreted as boolean values; given that any one of them is `l-me: true`, the result will be also - otherwise, `l-me: false` will be the result.

```markup-expression
lhs or rhs
```

| lhs           | rhs           | Result         |
|:-------------:|:-------------:|:--------------:|
| `l-me: false` | `l-me: false` | `l-me: false`  |
| `l-me: false` | `l-me: true`  | `l-me: true`   |
| `l-me: true`  | `l-me: false` | `l-me: true`   |
| `l-me: true`  | `l-me: true`  | `l-me: true`   |

### And (Conjunction)

By stringing two expressions together using the `and` operator, both the left- and the right hand side will be interpreted as boolean values; given that both are `l-me: true`, the result will be also - otherwise, `l-me: false` will be the result.

```markup-expression
lhs and rhs
```

| lhs     | rhs     | Result  |
|:-------:|:-------:|:-------:|
| `l-me: false` | `l-me: false` | `l-me: false` |
| `l-me: false` | `l-me: true`  | `l-me: false` |
| `l-me: true`  | `l-me: false` | `l-me: false` |
| `l-me: true`  | `l-me: true`  | `l-me: true`  |

### Branching

If an expression is to be selected out of two branches, one for `l-me: true` and one for `l-me: false`, given a boolean input, `then`/`else` will be the operators of choice.

```markup-expression
input then branch_true else branch_false
```

| input   | Result          |
|:-------:|:---------------:|
| `l-me: false` | `l-me: branch_false`  |
| `l-me: true`  | `l-me: branch_true`   |

If the false-branch is not required, it may simply be omitted (becomes `l-me: null`), resulting in the terse syntax of:

```markup-expression
input then branch_true
```

### Comparison Operators

| Comparison            | Operator            | True when                                       |
|:---------------------:|:-------------------:|:-----------------------------------------------:|
| Equal To              | `l-me: a eq b`      | `l-me: a` is equal to `l-me: b`                 |
| Not Equal To          | `l-me: a neq b`     | `l-me: a` is not equal to `l-me: b`             |
| Is String Contained   | `l-me: a in b`      | `l-me: a` is contained in `l-me: b`             |
| Regex Matches         | `l-me: a matches b` | `l-me: a` matches regex `l-me: b`               |
| Greater Than          | `l-me: a > b`       | `l-me: a` is greater than `l-me: b`             |
| Greater Than Or Equal | `l-me: a >= b`      | `l-me: a` is greater than or equal to `l-me: b` |
| Less Than             | `l-me: a < b`       | `l-me: a` is less than `l-me: b`                |
| Less Than Or Equal    | `l-me: a <= b`      | `l-me: a` is less than or equal to `l-me: b`    |

## Fallback Values

If a variable or an expression in general may return a `l-me: null`-value, a fallback can be provided by appending it with a double-questionmark (`??`), followed by the actual value.

```markup-expression
input ?? fallback_variable
```

| input            | Result                    |
|:----------------:|:-------------------------:|
| `l-me: null`     | `l-me: fallback_variable` |
| non-`l-me: null` | `l-me: input`             |

## Operator Precedence

The following table provides an overview of all existing operators as well as their precedence, where precedence is defined as follows: a higher number is evaluated first. Since multiplication has higher precedence than addition, the input `l-me: a + b * c + d` is equal to `l-me: a + (b * c) + d`; to specify an alternate order, make use of parentheses where needed, e.g. `l-me: (a + b) * c + d`. or `l-me: (a + b) * (c + d)`.

Associativity regards the order of operations on chains of operators of same precedence, with left-to-right posing the standard in the majority of cases, e.g. `l-me: a + b + c` being equal to `l-me: ((a + b) + c)`, whereas exponentiation (due to power-towers) is right-to-left, e.g. `l-me: a ^ b ^ c` being equal to `l-me: a ^ (b ^ c)` - the same holds true for all prefix-operators, e.g. negation, flip-sign and string-transform.

<table style={{textAlign: 'center'}}>
  <thead>
    <tr>
      <th>Operator</th>
      <th>Symbol</th>
      <th>Precedence</th>
      <th>Associativity</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Branching</td>
      <td>`then`</td>
      <td>1</td>
      <td rowSpan={18}>left-to-right</td>
    </tr>
    <tr>
      <td>Disjunction</td>
      <td>`or`</td>
      <td>2</td>
    </tr>
    <tr>
      <td>Conjunction</td>
      <td>`and`</td>
      <td>3</td>
    </tr>
    <tr>
      <td>Equal To</td>
      <td>`eq`</td>
      <td rowSpan={4}>4</td>
    </tr>
    <tr>
      <td>Not Equal To</td>
      <td>`neq`</td>
    </tr>
    <tr>
      <td>String Contained</td>
      <td>`in`</td>
    </tr>
    <tr>
      <td>Matches Regex</td>
      <td>`matches`</td>
    </tr>
    <tr>
      <td>Greater Than</td>
      <td>`>`</td>
      <td rowSpan={4}>5</td>
    </tr>
    <tr>
      <td>Greater Than Or Equal</td>
      <td>`>=`</td>
    </tr>
    <tr>
      <td>Less Than</td>
      <td>`<`</td>
    </tr>
    <tr>
      <td>Less Than Or Equal</td>
      <td>`<=`</td>
    </tr>
    <tr>
      <td>Concatenation</td>
      <td>`&`</td>
      <td>6</td>
    </tr>
    <tr>
      <td>Range</td>
      <td>`..`</td>
      <td>7</td>
    </tr>
    <tr>
      <td>Addition</td>
      <td>`+`</td>
      <td rowSpan={2}>8</td>
    </tr>
    <tr>
      <td>Subtraction</td>
      <td>`-`</td>
    </tr>
    <tr>
      <td>Multiplication</td>
      <td>`*`</td>
      <td rowSpan={3}>9</td>
    </tr>
    <tr>
      <td>Division</td>
      <td>`/`</td>
    </tr>
    <tr>
      <td>Modulo</td>
      <td>`%`</td>
    </tr>
    <tr>
      <td>Exponentiation</td>
      <td>`^`</td>
      <td>10</td>
      <td>right-to-left</td>
    </tr>
    <tr>
      <td>String-Split Literal</td>
      <td>`split`</td>
      <td rowSpan={3}>11</td>
      <td rowSpan={4}>left-to-right</td>
    </tr>
    <tr>
      <td>String-Split Regex</td>
      <td>`rsplit`</td>
    </tr>
    <tr>
      <td>Repeat</td>
      <td>`**`</td>
    </tr>
    <tr>
      <td>Fallback</td>
      <td>`??`</td>
      <td>12</td>
    </tr>
    <tr>
      <td>Negation</td>
      <td>`not`</td>
      <td rowSpan={15}>13</td>
      <td rowSpan={15}>right-to-left</td>
    </tr>
    <tr>
      <td>Flip Sign</td>
      <td>`-`</td>
    </tr>
    <tr>
      <td>Uppercase</td>
      <td>`upper()`</td>
    </tr>
    <tr>
      <td>Lowercase</td>
      <td>`lower()`</td>
    </tr>
    <tr>
      <td>Titlecase</td>
      <td>`title()`</td>
    </tr>
    <tr>
      <td>Toggle Casing</td>
      <td>`toggle()`</td>
    </tr>
    <tr>
      <td>Slugify</td>
      <td>`slugify()`</td>
    </tr>
    <tr>
      <td>Asciify</td>
      <td>`asciify()`</td>
    </tr>
    <tr>
      <td>Trim</td>
      <td>`trim()`</td>
    </tr>
    <tr>
      <td>Reverse</td>
      <td>`reverse()`</td>
    </tr>
    <tr>
      <td>To Long</td>
      <td>`long()`</td>
    </tr>
    <tr>
      <td>To Double</td>
      <td>`double()`</td>
    </tr>
    <tr>
      <td>Round</td>
      <td>`round()`</td>
    </tr>
    <tr>
      <td>Floor</td>
      <td>`floor()`</td>
    </tr>
    <tr>
      <td>Ceil</td>
      <td>`ceil()`</td>
    </tr>
    <tr>
      <td>Subscripting</td>
      <td>`[]`</td>
      <td rowSpan={3}>14</td>
      <td rowSpan={4}>left-to-right</td>
    </tr>
    <tr>
      <td>Substring</td>
      <td>`[:]`</td>
    </tr>
    <tr>
      <td>Member</td>
      <td>`.`</td>
    </tr>
    <tr>
      <td>Parentheses</td>
      <td>`()`</td>
      <td>15</td>
    </tr>
  </tbody>
</table>