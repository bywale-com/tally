-- Drop inverted-funnel mega-corp board seeds from earlier drafts.
DELETE FROM company_slugs
WHERE slug IN ('anthropic', 'stripe', 'notion', 'ramp', 'openai', 'superpanel');
