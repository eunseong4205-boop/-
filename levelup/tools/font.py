#!/usr/bin/env python3
"""갈무리(Galmuri, SIL OFL 1.1) 글꼴을 게임에 쓰는 글자만 남겨 woff2로 줄인다.

사용법: python3 levelup/tools/font.py <갈무리 ttf가 있는 폴더>
- src/ 안의 모든 글자 + ASCII + KS X 1001 한글 2,350자(이름 입력용) + 기호
- 결과: levelup/assets/fonts/*.woff2
"""
import os
import sys
from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT, 'assets', 'fonts')
FONTS = [('Galmuri11.ttf', 'galmuri11.woff2'), ('Galmuri11-Bold.ttf', 'galmuri11b.woff2'), ('Galmuri14.ttf', 'galmuri14.woff2')]


def used_chars():
    chars = set()
    for base, _, files in os.walk(SRC):
        for f in files:
            if f.endswith(('.js', '.html', '.css')):
                with open(os.path.join(base, f), encoding='utf-8') as fh:
                    chars.update(fh.read())
    return chars


def ksx1001_hangul():
    out = set()
    for cp in range(0xAC00, 0xD7A4):
        ch = chr(cp)
        try:
            ch.encode('euc-kr')
            out.add(ch)
        except UnicodeEncodeError:
            pass
    return out


def main():
    src_dir = sys.argv[1]
    chars = used_chars() | ksx1001_hangul()
    chars |= {chr(c) for c in range(0x20, 0x7F)}
    chars |= set('★☆♥♡♪♬◆◇●○■□▲△▼▽◀▶←→↑↓※·…「」『』《》〈〉【】─━│┃┏┓┗┛×÷±∞✦✧❤')
    chars |= {chr(c) for c in range(0x3131, 0x3164)}  # 자모
    text = ''.join(sorted(c for c in chars if c.isprintable() or c == ' '))
    os.makedirs(OUT, exist_ok=True)
    for src, dst in FONTS:
        opts = subset.Options()
        opts.flavor = 'woff2'
        opts.layout_features = ['*']
        opts.name_IDs = ['*']
        opts.notdef_outline = True
        font = subset.load_font(os.path.join(src_dir, src), opts)
        sub = subset.Subsetter(opts)
        sub.populate(text=text)
        sub.subset(font)
        path = os.path.join(OUT, dst)
        subset.save_font(font, path, opts)
        print(dst, os.path.getsize(path), 'bytes')
    print('glyph set', len(text))


if __name__ == '__main__':
    main()
