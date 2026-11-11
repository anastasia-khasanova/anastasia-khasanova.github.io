# Выбранные проблемные состояния — 11 ноября 2026

Финальный выбор пользователя:

- `boy-problem.png` — тревожный мальчик в позе долголетия, выбран на скриншоте83d5921a.
- `girl-problem.png` — тревожная девочка с руками на бёдрах, выбрана на скриншотеa116d4b8. В интерфейсе отображается с opacity0.9; PNG сохранён без дополнительных преобразований.

Оба PNG созданы встроенным image_gen, transparent_background=true, скопированы в проект без изменения пикселей. Красные области в изображения не запечены: отдельный CSS-слой использует тот же alpha-mask, геометрию и color blend, чтобы сохранить свет/полупрозрачность и убирать предупреждение при исправлении.

Обычные состояния берутся из утверждённого пользователем листа — существующие avatars-20261109 для пяти разделов обоих полов. Внешность не заменена. Для всех пяти критических разделов используется выбранный проблемный персонаж своего пола; конкретная зона меняется по причине предупреждения. Неутверждённые boy-{strength,immune,intelligence,longevity,neuro}.png в этом каталоге — исторические черновики, в runtime не используются. Остальные отклонённые генерации не подключены.

## Промпт мальчика

PRECISE EDIT of the original supplied image, not a new character. Retain EXACT same boy identity, silhouette, framing, pose, clothing and hair. Keep preschool baby proportions: original oversized rounded head, plump puffy cheeks, short neck, chubby little arms and legs. Absolutely preserve original eye shape, eye size, spacing, iris size and gaze; if eyes are closed keep them closed. Do not make a thinner/older/different child. Change ONLY the smile/mouth and eyebrows very subtly to a worried or fatigued problem-state expression; NOT exaggerated suffering. No new pose. Material must read as the SAME luminous, semi-transparent cyan holographic SHELL: thin luminous contour, soft transmitted light through blue outer volume, subtly translucent clothing and body, gentle edge aura. Not opaque blue painted plastic, not a solid blue toy, not dark saturated flat blue. Preserve soft 3D face volume and childlike softness; no bones, organs, mechanical components, particles, text or props. Keep full body visible and exact original feet placement. Do not bake in red: separate UI layer adds warning zones. Genuinely transparent RGBA background, no black/white fill, no floor, no checkerboard. Preserve identity and geometry much more strongly than the expression edit.

## Промпт девочки

Edit this existing illustrated game avatar. Preserve the exact same character identity, same face, round cheeks, eye size and shape, hairstyle, dress, pose, silhouette, proportions and framing. Only change the smile to a small worried mouth and gently worried eyebrows. Keep the same soft glowing cyan holographic visual style, with luminous edges and airy volumetric-light shading rather than a solid painted surface. Dress and all original character details remain unchanged. One full-body character on a transparent background. No text or red highlights.

## Проверка

Просмотрены выбранные изображения и Canvas-композиция на светлом фоне с зонами головы, торса, ног. Проверены20переходов здорового/критического состояния для пяти категорий и обоих полов, совпадение геометрии маски с PNG, существование ресурсов. Итоговый браузерный просмотр недоступен из-за отказа CUA по URL-политике.
