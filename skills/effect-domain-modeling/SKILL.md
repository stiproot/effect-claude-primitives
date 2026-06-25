---
name: effect-domain-modeling
description: Effect-TS domain-modeling patterns – Schema contracts (Schema.Struct, decode/decodeUnknown, validate, Schema.transform during parsing), Brand for validated domain types (Email, UserId, PositiveInt), Data.TaggedError for typed domain errors, Option for missing/optional values, and distinguishing "not found" from real failures with Effect<Option<A>, E>. Use whenever shaping a domain in Effect code – defining schemas and types upfront, parsing/validating untrusted input, branding a primitive so only valid values construct, modeling an optional field or absent value, chaining Option operations (map/flatMap/getOrElse/orElse), or deciding whether a missing record is an error or just None – even if the user just says "validate this", "model this entity", "make this type safe", or "handle the optional field".
source-rules:
  - domain-modeling.md
  - value-handling.md
---

# Effect – Domain Modeling

Domain modeling in Effect means making illegal states unrepresentable and pushing
validation to the edges. A primitive `string` could be anything; a `Schema`-decoded,
`Brand`-tagged `Email` has earned its type. Errors are typed values you tag and
match, not exceptions you hope a caller catches. And a value that might be absent
is an `Option`, never a `null` you forget to check. The payoff: the compiler – not
runtime asserts – enforces your domain's rules.

## When to use this

- Defining the shape of an entity or API contract upfront with `Schema.Struct`,
  then decoding untrusted input with `Schema.decode` / `Schema.decodeUnknown`.
- Branding a primitive (`Email`, `UserId`, `PositiveInt`) so only validated values
  can be constructed, and validating-and-branding in one step with `Schema.brand`.
- Designing typed domain errors with `Data.TaggedError` so failures carry data and
  recover by tag.
- Modeling optional fields and absent values with `Option`, and chaining lookups
  with `map` / `flatMap` / `getOrElse` / `orElse` instead of null checks.
- Distinguishing a recoverable "not found" from a real failure by returning
  `Effect<Option<A>, E>`.
- Transforming data during validation (e.g. parse a string into a `Date`) with
  `Schema.transform` / `Schema.transformOrFail`.

## Mental model

Three tools cover most of domain modeling:

- **`Schema`** is the contract – one definition gives you the static type
  (`Schema.Schema.Type<typeof S>`), runtime validation (`decode`), and transformation.
  Decode failures surface as a `ParseError` in the `E` channel.
- **`Brand`** narrows a primitive into a distinct domain type. `Email = string &
  Brand.Brand<"Email">` is still a string at runtime but unassignable from a raw
  string – combine with `Schema.brand` so the only path to an `Email` is through
  validation.
- **`Option<A>`** makes absence explicit. `Some`/`None` force the caller to handle
  the missing case. Use it for optional fields and lookups; reserve the `E` channel
  for actual failures. `Effect<Option<A>, E>` says "this can fail with `E`, or
  succeed with a value that may or may not be there" – the honest signature for a
  DB lookup that can error *and* can find nothing.

## Core patterns

### Define a contract once with Schema

One schema yields both the type and the runtime validator:

```typescript
import { Schema, Effect } from "effect";

const UserSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
});

type User = Schema.Schema.Type<typeof UserSchema>;

const processUserInput = (input: unknown) =>
  Schema.decodeUnknown(UserSchema)(input).pipe(
    Effect.catchTag("ParseError", () => Effect.succeed(null))
  );
```

### Validate and brand in one step

`Schema.brand` attaches a brand to a validated schema, so the only way to obtain an
`Email` is to pass the validation:

```typescript
import { Brand, Schema } from "effect";

type Email = string & Brand.Brand<"Email">;

const EmailSchema = Schema.String.pipe(
  Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/),
  Schema.brand("Email")
);

// downstream code can trust the type
const sendWelcome = (email: Email) => {/* ... */};
```

### Typed domain errors with Data.TaggedError

Tagged errors carry data and recover by `_tag`, so each failure mode is distinct
and handled type-safely:

```typescript
import { Data, Effect } from "effect";

class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  readonly userId: string;
}> {}
class InvalidEmailError extends Data.TaggedError("InvalidEmailError")<{
  readonly email: string;
  readonly reason: string;
}> {}

const validateEmail = (email: string): Effect.Effect<string, InvalidEmailError> =>
  email.includes("@")
    ? Effect.succeed(email)
    : Effect.fail(new InvalidEmailError({ email, reason: "Missing @ symbol" }));
```

### Distinguish "not found" from failure

Return `Effect<Option<A>, E>` so the caller handles three outcomes – error, found,
absent – explicitly:

```typescript
import { Effect, Option, Data } from "effect";

class DatabaseError extends Data.TaggedError("DatabaseError") {}

const findUserInDb = (id: number): Effect.Effect<Option.Option<User>, DatabaseError> =>
  Effect.gen(function* () {
    const row = yield* Effect.try({
      try: () => (id === 1 ? { id: 1, name: "Paul" } : null),
      catch: () => new DatabaseError(),
    });
    return Option.fromNullable(row);
  });
```

### Chain optional values

Compose `Option` operations instead of nested null checks; a `None` anywhere
short-circuits the pipeline, and `getOrElse` / `orElse` supply fallbacks:

```typescript
import { Option, pipe } from "effect";

const theme = pipe(
  Option.some("user-42"),
  Option.flatMap(findUser),
  Option.flatMap((user) => getSettings(user.id)),
  Option.map((settings) => settings.theme),
  Option.getOrElse(() => "light")
);
```

## Pattern reference

The complete pattern set lives in `references/`. Open the file for the area you
need – each entry below is a `## ` heading inside that file.

### `references/domain-modeling.md` (15 patterns)
- Accumulate Multiple Errors with Either
- Avoid Long Chains of .andThen; Use Generators Instead
- Create Type-Safe Errors
- Define Contracts Upfront with Schema
- Define Type-Safe Errors with Data.TaggedError
- Distinguish 'Not Found' from Errors
- Handle Missing Values with Option
- Model Optional Values Safely with Option
- Model Validated Domain Types with Brand
- Modeling Validated Domain Types with Brand
- Parse and Validate Data with Schema.decode
- Transform Data During Validation with Schema
- Use Effect.gen for Business Logic
- Validating and Parsing Branded Types
- Your First Domain Model

### `references/value-handling.md` (2 patterns)
- Optional Pattern 1: Handling None and Some Values
- Optional Pattern 2: Optional Chaining and Composition
