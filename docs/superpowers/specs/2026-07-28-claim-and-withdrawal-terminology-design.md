# Claim and Withdrawal Terminology Design

## Goal

Keep reward claiming and Token withdrawal language distinct in all user-facing AIGO UI.

## Terminology

- Use `领取` for claiming order, static, or dynamic rewards.
- Use `提取` only for Token withdrawal/redeem actions that would otherwise be called `提现`.
- Do not globally replace `领取` with `提取`.

## Scope

Update the three reward confirmation popups on the home page—static rewards, dynamic rewards, and individual order rewards—from `确认要提取吗？` to `确认要领取吗？`.

Keep the saving-page Token withdrawal label as `提取` and retain the rule that UI source must not use `提现` for that withdrawal action.

Update every enabled project locale for the new confirmation key. Update terminology and home-page tests to verify that reward confirmation uses `领取` while Token withdrawal continues to use `提取`.

## Production Popup Investigation

The production site currently serves the same hashed JavaScript and CSS assets as the local production build. The blank-popup screenshot therefore is not explained by an outdated deployment.

The mobile wallet WebView renders the title, message, and confirmation button in the DOM, but the `gradient-card` border `::before` pseudo-element overlays them. Its mask does not reliably exclude the card centre in that WebView. Keep the pseudo-element at stacking level `0` and explicitly place direct card content at level `1` within an isolated stacking context. This preserves the gradient border while keeping all modal content visible across browser engines.

## Verification

Run the focused terminology and home-page tests, lint, TypeScript build, and a production build. Verify the three reward confirmation dialogs in a wallet-compatible mobile browser after deployment.
