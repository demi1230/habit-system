export interface ShareAchievementInput {
  title: string;
  subtitle: string;
  accentColor: string;
  badgeIcon?: string | null;
  badgeLabel?: string | null;
  xpLabel?: string | null;
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

function buildShareImage(input: ShareAchievementInput): Blob {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Canvas is not available.');

  const accent = input.accentColor || '#18A68A';

  const bgGradient = ctx.createLinearGradient(0, 0, W, H);
  bgGradient.addColorStop(0, '#F7FCFF');
  bgGradient.addColorStop(1, '#EEF7FB');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, W, H);

  ctx.globalAlpha = 0.16;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(220, 220, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(868, 840, 228, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  const cardW = 820;
  const cardH = 760;
  const cardX = (W - cardW) / 2;
  const cardY = (H - cardH) / 2 - 24;

  ctx.fillStyle = 'rgba(48, 52, 55, 0.08)';
  roundRect(ctx, cardX, cardY + 18, cardW, cardH, 44);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, cardX, cardY, cardW, cardH, 44);
  ctx.fill();

  const headerChipW = 210;
  const headerChipH = 52;
  const headerChipX = W / 2 - headerChipW / 2;
  const headerChipY = cardY + 50;
  ctx.fillStyle = `${accent}18`;
  roundRect(ctx, headerChipX, headerChipY, headerChipW, headerChipH, 26);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.font = '600 24px Montserrat, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Achievement Unlocked', W / 2, headerChipY + headerChipH / 2);

  const emojiCx = W / 2;
  const emojiCy = cardY + 224;
  const circleR = 96;

  ctx.globalAlpha = 0.18;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(emojiCx, emojiCy, circleR + 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = `${accent}28`;
  ctx.beginPath();
  ctx.arc(emojiCx, emojiCy, circleR, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '118px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#202325';
  ctx.fillText(input.badgeIcon ?? '🏅', emojiCx, emojiCy + 4);

  if (input.badgeLabel) {
    const badgeText = input.badgeLabel;
    ctx.font = '600 26px Montserrat, Arial, sans-serif';
    const badgeW = Math.min(ctx.measureText(badgeText).width + 60, 480);
    const badgeH = 48;
    const badgeX = W / 2 - badgeW / 2;
    const badgeY = cardY + 346;
    ctx.fillStyle = `${accent}14`;
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 24);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, W / 2, badgeY + badgeH / 2);
  }

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#202325';
  ctx.font = '700 58px Montserrat, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(input.title, W / 2, cardY + 438);

  ctx.fillStyle = '#5F6B74';
  ctx.font = '400 31px Montserrat, Arial, sans-serif';
  wrapTextCenter(ctx, input.subtitle, W / 2, cardY + 498, 660, 46, 3);

  if (input.xpLabel) {
    const chipLabel = input.xpLabel;
    ctx.font = '600 26px Montserrat, Arial, sans-serif';
    const chipW = ctx.measureText(chipLabel).width + 52;
    const chipH = 48;
    const chipX = W / 2 - chipW / 2;
    const chipY = cardY + 624;
    ctx.fillStyle = '#303437';
    roundRect(ctx, chipX, chipY, chipW, chipH, 24);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(chipLabel, W / 2, chipY + chipH / 2);
  }

  const divY = cardY + cardH - 110;
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#202325';
  ctx.fillRect(cardX + 44, divY, cardW - 88, 1);
  ctx.globalAlpha = 1;

  ctx.font = '700 42px Montserrat, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = accent;
  ctx.fillText('Dadii', W / 2, cardY + cardH - 52);

  return dataURLtoBlob(canvas.toDataURL('image/png'));
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
  let line = '';
  let lineIndex = 0;

  for (const word of words) {
    if (lineIndex >= maxLines) break;
    const testLine = line + word + ' ';
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.textAlign = 'center';
      ctx.fillText(line.trim(), cx, y + lineIndex * lineHeight);
      line = word + ' ';
      lineIndex++;
    } else {
      line = testLine;
    }
  }

  if (line && lineIndex < maxLines) {
    ctx.textAlign = 'center';
    ctx.fillText(line.trim(), cx, y + lineIndex * lineHeight);
  }
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
