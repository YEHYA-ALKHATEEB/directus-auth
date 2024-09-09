import { authentication, createDirectus, rest } from '@directus/sdk';

// const client = createDirectus('http://localhost:8055/').with(authentication()).with(rest());

const client = createDirectus('http://localhost:8055/').with(rest());



export {client}
