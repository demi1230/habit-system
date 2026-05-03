export interface ShareAchievementInput {
  title: string;
  subtitle: string;
  accentColor: string;
  badgeIcon?: string | null;
  xpLabel?: string | null;
  userName?: string | null;
  text: string;
}

export type ShareAchievementResult =
  | 'shared'
  | 'shared-text'
  | 'copied-image'
  | 'copied-text'
  | 'downloaded';

// Synchronous blob conversion preserves user gesture context for navigator.share on iOS.
function dataURLtoBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)![1];
  const bstr = atob(data);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new Blob([u8arr], { type: mime });
}

function drawShareBadgeOrPlaceholder(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  badgeIcon: string | null | undefined,
) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const t = badgeIcon?.trim();
  if (t) {
    ctx.font = '118px serif';
    ctx.fillStyle = '#202325';
    ctx.fillText(t, cx, cy);
    return;
  }

  ctx.strokeStyle = '#202325';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 39, cy - 6);
  ctx.lineTo(cx - 10, cy + 32);
  ctx.lineTo(cx + 48, cy - 40);
  ctx.stroke();
}

function buildShareImage(input: ShareAchievementInput): Blob {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Canvas is not available.');

  const accent = input.accentColor || '#18A68A';

  const bgGradient = ctx.createLinearGradient(0, H, W, 0);
  bgGradient.addColorStop(0, `${accent}28`);
  bgGradient.addColorStop(0.6, `${accent}10`);
  bgGradient.addColorStop(1, '#FAFCFF');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, W, H);

  ctx.globalAlpha = 0.22;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(180, 180, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(900, 860, 280, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  const cardW = 820;
  const cardH = 800;
  const cardX = (W - cardW) / 2;
  const cardY = (H - cardH) / 2 - 24;

  ctx.fillStyle = 'rgba(48, 52, 55, 0.08)';
  roundRect(ctx, cardX, cardY + 18, cardW, cardH, 44);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, cardX, cardY, cardW, cardH, 44);
  ctx.fill();
  ctx.strokeStyle = `${accent}30`;
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 44);
  ctx.stroke();

  const headerLabel = 'Амжилт нээгдлээ';
  const headerChipH = 52;
  ctx.font = '600 24px Montserrat, Arial, sans-serif';
  const headerChipW = Math.min(ctx.measureText(headerLabel).width + 56, cardW - 96);
  const headerChipX = W / 2 - headerChipW / 2;
  const headerChipY = cardY + 50;
  ctx.fillStyle = accent;
  roundRect(ctx, headerChipX, headerChipY, headerChipW, headerChipH, 26);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(headerLabel, W / 2, headerChipY + headerChipH / 2);

  const emojiCx = W / 2;
  const emojiCy = cardY + 232;
  const circleR = 96;

  ctx.globalAlpha = 0.12;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(emojiCx, emojiCy, circleR + 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = `${accent}38`;
  ctx.beginPath();
  ctx.arc(emojiCx, emojiCy, circleR, 0, Math.PI * 2);
  ctx.fill();

  drawShareBadgeOrPlaceholder(ctx, emojiCx, emojiCy + 4, input.badgeIcon);

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#202325';
  ctx.font = '700 58px Montserrat, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(input.title, W / 2, cardY + 422);

  ctx.fillStyle = '#5F6B74';
  ctx.font = '400 30px Montserrat, Arial, sans-serif';
  wrapTextCenter(ctx, input.subtitle, W / 2, cardY + 482, 660, 44, 2);

  if (input.xpLabel) {
    const chipLabel = input.xpLabel;
    ctx.font = '600 26px Montserrat, Arial, sans-serif';
    const chipW = ctx.measureText(chipLabel).width + 52;
    const chipH = 48;
    const chipX = W / 2 - chipW / 2;
    const chipY = cardY + 596;
    ctx.fillStyle = `${accent}22`;
    roundRect(ctx, chipX, chipY, chipW, chipH, 24);
    ctx.fill();
    ctx.strokeStyle = `${accent}55`;
    ctx.lineWidth = 1.5;
    roundRect(ctx, chipX, chipY, chipW, chipH, 24);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(chipLabel, W / 2, chipY + chipH / 2);
  }

  const divY = cardY + cardH - 134;
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = accent;
  ctx.fillRect(cardX + 44, divY, cardW - 88, 1);
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  if (input.userName) {
    ctx.fillStyle = '#5F6B74';
    ctx.font = '500 26px Montserrat, Arial, sans-serif';
    ctx.fillText(truncateToWidth(ctx, input.userName, cardW - 120), W / 2, cardY + cardH - 84);

    ctx.font = '700 38px Montserrat, Arial, sans-serif';
    ctx.fillStyle = accent;
    ctx.fillText('Dadal app', W / 2, cardY + cardH - 36);
  } else {
    ctx.font = '700 38px Montserrat, Arial, sans-serif';
    ctx.fillStyle = accent;
    ctx.fillText('Dadal app', W / 2, cardY + cardH - 56);
  }

  return dataURLtoBlob(canvas.toDataURL('image/png'));
}

function truncateToWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  const ellipsis = '…';
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (ctx.measureText(text.slice(0, mid) + ellipsis).width <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return text.slice(0, lo).trimEnd() + ellipsis;
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function wrapTextCenter(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(' ');
  ctx.textAlign = 'center';

  const lines: string[] = [];
  let line = '';
  let truncated = false;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) {
        const remaining = words.slice(i).join(' ');
        if (remaining) truncated = true;
        break;
      }
    } else {
      line = testLine;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);

  if (truncated && lines.length === maxLines) {
    const last = lines[lines.length - 1];
    const withEllipsis = `${last}…`;
    lines[lines.length - 1] =
      ctx.measureText(withEllipsis).width <= maxWidth
        ? withEllipsis
        : truncateToWidth(ctx, last, maxWidth);
  }

  lines.forEach((l, i) => {
    ctx.fillText(l, cx, y + i * lineHeight);
  });
}

let isSharing = false;

export async function shareAchievement(input: ShareAchievementInput): Promise<ShareAchievementResult> {
  if (isSharing) {
    throw new Error('Share is already in progress.');
  }

  isSharing = true;

  try {
    const blob = buildShareImage(input);
    const file = new File([blob], 'achievement.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: input.title,
        text: input.text,
        files: [file],
      });
      return 'shared';
    }

    if (navigator.share) {
      await navigator.share({
        title: input.title,
        text: input.text,
      });
      return 'shared-text';
    }

    if (
      window.isSecureContext &&
      navigator.clipboard?.write &&
      typeof ClipboardItem !== 'undefined'
    ) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        return 'copied-image';
      } catch {
        // Continue into the next fallback.
      }
    }

    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(input.text);
      return 'copied-text';
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'achievement.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
    return 'downloaded';
  } finally {
    isSharing = false;
  }
}
