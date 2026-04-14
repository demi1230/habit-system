import svgPaths from "./svg-88o2ok4tf3";
import imgEllipse1 from "./7f70a658a28393afcbddde6988bc7f4c4130c193.png";
import imgHabitProfile from "./e26e9fe797c0ed6d681176a232f8c863a5c32ba4.png";
import imgHabitProfile1 from "./9ac9c858bbb4631dccd112b2c0479cf4e738c6ac.png";
import imgHabitProfile2 from "./28c5d348b2b940f2c4855e0f432355bcc547b5e2.png";

function HomeHover() {
  return (
    <div className="bg-[#303437] content-stretch flex gap-[8px] h-[43.478px] items-center px-[12px] py-[10px] relative rounded-[48px] shrink-0" data-name="Home Hover">
      <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#f2f4f5] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Дадал</p>
      </div>
      <div className="relative shrink-0 size-[16px]" data-name="Union">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <path d={svgPaths.p3ed50f00} fill="var(--fill-0, white)" id="Union" />
        </svg>
      </div>
    </div>
  );
}

function Calendar() {
  return (
    <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[10px] relative shrink-0 w-[393px]" data-name="Calendar">
      <div className="relative shrink-0 size-[43px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" height="43" src={imgEllipse1} width="43" />
      </div>
      <div className="flex flex-[1_0_0] flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] min-h-px min-w-px relative text-[#202325] text-[14px]">
        <p className="leading-[20px]">Сайнуу Дэми?</p>
      </div>
      <HomeHover />
    </div>
  );
}

function Frame() {
  return (
    <div className="bg-[#f7fcff] content-stretch flex flex-col items-start pt-[60px] shrink-0 sticky top-0">
      <Calendar />
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-[#303437] content-stretch flex flex-col h-[22px] items-center justify-center px-[8px] py-[4px] relative rounded-[8px] shrink-0 w-[24px]">
      <div className="flex flex-col font-['DM_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#f2f4f5] text-[14px] text-center whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="leading-[20px]">15</p>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[29px]">
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.6)] text-center whitespace-nowrap">
          <p className="leading-[20px]">Да</p>
        </div>
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#979c9e] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[20px]">13</p>
        </div>
        <div className="relative shrink-0 size-[3px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 3">
            <circle cx="1.5" cy="1.5" fill="var(--fill-0, #D9D9D9)" fillOpacity="0.09" id="Ellipse 2" r="1.5" />
          </svg>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[29px]">
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.6)] text-center whitespace-nowrap">
          <p className="leading-[20px]">Мя</p>
        </div>
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#979c9e] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[20px]">14</p>
        </div>
        <div className="relative shrink-0 size-[3px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 3">
            <circle cx="1.5" cy="1.5" fill="var(--fill-0, #D9D9D9)" fillOpacity="0.09" id="Ellipse 2" r="1.5" />
          </svg>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[29px]">
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.6)] text-center whitespace-nowrap">
          <p className="leading-[20px]">Лх</p>
        </div>
        <Frame2 />
        <div className="relative shrink-0 size-[3px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 3">
            <circle cx="1.5" cy="1.5" fill="var(--fill-0, #303537)" id="Ellipse 2" r="1.5" />
          </svg>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[29px]">
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.6)] text-center whitespace-nowrap">
          <p className="leading-[20px]">Пү</p>
        </div>
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#979c9e] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[20px]">16</p>
        </div>
        <div className="relative shrink-0 size-[3px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 3">
            <circle cx="1.5" cy="1.5" fill="var(--fill-0, #D9D9D9)" fillOpacity="0.09" id="Ellipse 2" r="1.5" />
          </svg>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[29px]">
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.6)] text-center whitespace-nowrap">
          <p className="leading-[20px]">Ба</p>
        </div>
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#979c9e] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[20px]">17</p>
        </div>
        <div className="relative shrink-0 size-[3px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 3">
            <circle cx="1.5" cy="1.5" fill="var(--fill-0, #D9D9D9)" fillOpacity="0.09" id="Ellipse 2" r="1.5" />
          </svg>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[29px]">
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.6)] text-center whitespace-nowrap">
          <p className="leading-[20px]">Бя</p>
        </div>
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#979c9e] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[20px]">18</p>
        </div>
        <div className="relative shrink-0 size-[3px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 3">
            <circle cx="1.5" cy="1.5" fill="var(--fill-0, #D9D9D9)" fillOpacity="0.09" id="Ellipse 2" r="1.5" />
          </svg>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[29px]">
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.6)] text-center whitespace-nowrap">
          <p className="leading-[20px]">Ня</p>
        </div>
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#979c9e] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[20px]">19</p>
        </div>
        <div className="relative shrink-0 size-[3px]">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 3">
            <circle cx="1.5" cy="1.5" fill="var(--fill-0, #D9D9D9)" fillOpacity="0.09" id="Ellipse 2" r="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame />
      <div className="bg-[rgba(0,0,0,0.04)] shrink-0 sticky top-0 w-full" data-name="Calendar">
        <div className="content-stretch flex flex-col items-start px-[24px] py-[8px] relative size-full">
          <Frame1 />
        </div>
      </div>
    </div>
  );
}

function Card() {
  return <div className="absolute bg-[rgba(179,179,253,0.67)] h-[95px] left-0 rounded-[24px] top-0 w-[216px]" data-name="Card" />;
}

function HabitProfile() {
  return (
    <div className="relative rounded-[24px] shrink-0 size-[44px]" data-name="habit profile">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[24px] size-full" src={imgHabitProfile} />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[178px]">
      <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#202325] text-[12px] w-full">
        <p className="leading-[20px]">Өдрийн ажлаа төлөвлөх</p>
      </div>
    </div>
  );
}

function FluentDumbbell20Regular() {
  return (
    <div className="h-[25.001px] relative shrink-0 w-[26px]" data-name="fluent:dumbbell-20-regular">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26 25.0006">
        <g id="fluent:dumbbell-20-regular">
          <path d={svgPaths.p2eaaee80} fill="var(--fill-0, #303437)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function FluentDumbbell20Regular1() {
  return (
    <div className="h-[24px] relative shrink-0 w-[23px]" data-name="fluent:dumbbell-20-regular">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 24">
        <g id="fluent:dumbbell-20-regular">
          <path clipRule="evenodd" d={svgPaths.p29fc8c00} fill="var(--fill-0, #303437)" fillRule="evenodd" id="Union" />
        </g>
      </svg>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[11px] items-start relative shrink-0 w-full">
      <div className="bg-white content-stretch flex gap-[10px] h-[35px] items-center overflow-clip p-[10px] relative rounded-[20px] shrink-0 w-[82px]" data-name="HabitTag">
        <FluentDumbbell20Regular />
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#303437] text-[14px] whitespace-nowrap">
          <p className="leading-[24px]">100</p>
        </div>
      </div>
      <div className="bg-white content-stretch flex gap-[10px] h-[35px] items-center overflow-clip p-[10px] relative rounded-[20px] shrink-0 w-[82px]" data-name="HabitTag">
        <FluentDumbbell20Regular1 />
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#303437] text-[14px] whitespace-nowrap">
          <p className="leading-[24px]">100</p>
        </div>
      </div>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[178px]">
      <Frame4 />
      <Frame3 />
    </div>
  );
}

function Card1() {
  return <div className="absolute bg-[rgba(255,187,187,0.6)] h-[99px] left-0 rounded-[24px] top-0 w-[275px]" data-name="Card" />;
}

function Frame5() {
  return (
    <div className="bg-[rgba(0,0,0,0.1)] content-stretch flex items-start overflow-clip p-[10px] relative rounded-[24px] shrink-0">
      <div className="flex flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[24px] text-black whitespace-nowrap">
        <p className="leading-[24px]">🙆‍♀️</p>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[178px]">
      <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#202325] text-[12px] w-full">
        <p className="leading-[24px]">10 минут ном унших</p>
      </div>
    </div>
  );
}

function FluentDumbbell20Regular2() {
  return (
    <div className="h-[25.001px] relative shrink-0 w-[26px]" data-name="fluent:dumbbell-20-regular">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26 25.0006">
        <g id="fluent:dumbbell-20-regular">
          <path d={svgPaths.p2eaaee80} fill="var(--fill-0, #303437)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function FluentDumbbell20Regular3() {
  return (
    <div className="h-[24px] relative shrink-0 w-[23px]" data-name="fluent:dumbbell-20-regular">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 24">
        <g id="fluent:dumbbell-20-regular">
          <path clipRule="evenodd" d={svgPaths.p29fc8c00} fill="var(--fill-0, #303437)" fillRule="evenodd" id="Union" />
        </g>
      </svg>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex gap-[11px] items-start relative shrink-0 w-full">
      <div className="bg-white content-stretch flex gap-[10px] h-[35px] items-center overflow-clip p-[10px] relative rounded-[20px] shrink-0 w-[82px]" data-name="HabitTag">
        <FluentDumbbell20Regular2 />
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#303437] text-[14px] whitespace-nowrap">
          <p className="leading-[24px]">100</p>
        </div>
      </div>
      <div className="bg-white content-stretch flex gap-[10px] h-[35px] items-center overflow-clip p-[10px] relative rounded-[20px] shrink-0 w-[82px]" data-name="HabitTag">
        <FluentDumbbell20Regular3 />
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#303437] text-[14px] whitespace-nowrap">
          <p className="leading-[24px]">100</p>
        </div>
      </div>
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[178px]">
      <Frame6 />
      <Frame7 />
    </div>
  );
}

function Card2() {
  return <div className="absolute bg-[#b3ffc7] h-[95px] left-0 rounded-[24px] top-0 w-[6px]" data-name="Card" />;
}

function HabitProfile1() {
  return (
    <div className="relative rounded-[12px] shrink-0 size-[44px]" data-name="habit profile">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[12px] size-full" src={imgHabitProfile1} />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[178px]">
      <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#202325] text-[12px] w-full">
        <p className="leading-[20px]">IELTS нэг section, part хийх</p>
      </div>
    </div>
  );
}

function FluentDumbbell20Regular4() {
  return (
    <div className="h-[25.001px] relative shrink-0 w-[26px]" data-name="fluent:dumbbell-20-regular">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26 25.0006">
        <g id="fluent:dumbbell-20-regular">
          <path d={svgPaths.p2eaaee80} fill="var(--fill-0, #303437)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function FluentDumbbell20Regular5() {
  return (
    <div className="h-[24px] relative shrink-0 w-[23px]" data-name="fluent:dumbbell-20-regular">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 24">
        <g id="fluent:dumbbell-20-regular">
          <path clipRule="evenodd" d={svgPaths.p29fc8c00} fill="var(--fill-0, #303437)" fillRule="evenodd" id="Union" />
        </g>
      </svg>
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex gap-[11px] items-start relative shrink-0 w-full">
      <div className="bg-white content-stretch flex gap-[10px] h-[35px] items-center overflow-clip p-[10px] relative rounded-[20px] shrink-0 w-[82px]" data-name="HabitTag">
        <FluentDumbbell20Regular4 />
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#303437] text-[14px] whitespace-nowrap">
          <p className="leading-[24px]">100</p>
        </div>
      </div>
      <div className="bg-white content-stretch flex gap-[10px] h-[35px] items-center overflow-clip p-[10px] relative rounded-[20px] shrink-0 w-[82px]" data-name="HabitTag">
        <FluentDumbbell20Regular5 />
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#303437] text-[14px] whitespace-nowrap">
          <p className="leading-[24px]">100</p>
        </div>
      </div>
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[178px]">
      <Frame8 />
      <Frame9 />
    </div>
  );
}

function Card3() {
  return (
    <div className="absolute h-[95px] left-0 top-0 w-[345px]" data-name="Card">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 345 95">
        <g id="Card">
          <rect fill="var(--fill-0, #77D8FF)" fillOpacity="0.6" height="95" rx="24" width="345" />
          <line id="Line 1" stroke="var(--stroke-0, black)" x1="85" x2="248" y1="28.5" y2="28.5" />
        </g>
      </svg>
    </div>
  );
}

function HabitProfile2() {
  return (
    <div className="relative rounded-[24px] shrink-0 size-[44px]" data-name="habit profile">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[24px] size-full" src={imgHabitProfile2} />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[178px]">
      <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(32,35,37,0.47)] w-full">
        <p className="leading-[20px]">IELTS нэг section, part хийх</p>
      </div>
    </div>
  );
}

function FluentDumbbell20Regular6() {
  return (
    <div className="h-[25.001px] relative shrink-0 w-[26px]" data-name="fluent:dumbbell-20-regular">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26 25.0006">
        <g id="fluent:dumbbell-20-regular">
          <path d={svgPaths.p2eaaee80} fill="var(--fill-0, #303437)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function FluentDumbbell20Regular7() {
  return (
    <div className="h-[24px] relative shrink-0 w-[23px]" data-name="fluent:dumbbell-20-regular">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 24">
        <g id="fluent:dumbbell-20-regular">
          <path clipRule="evenodd" d={svgPaths.p29fc8c00} fill="var(--fill-0, #303437)" fillRule="evenodd" id="Union" />
        </g>
      </svg>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex gap-[11px] items-start relative shrink-0 w-full">
      <div className="bg-white content-stretch flex gap-[10px] h-[35px] items-center overflow-clip p-[10px] relative rounded-[20px] shrink-0 w-[82px]" data-name="HabitTag">
        <FluentDumbbell20Regular6 />
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#303437] text-[14px] whitespace-nowrap">
          <p className="leading-[24px]">100</p>
        </div>
      </div>
      <div className="bg-white content-stretch flex gap-[10px] h-[35px] items-center overflow-clip p-[10px] relative rounded-[20px] shrink-0 w-[82px]" data-name="HabitTag">
        <FluentDumbbell20Regular7 />
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#303437] text-[14px] whitespace-nowrap">
          <p className="leading-[24px]">100</p>
        </div>
      </div>
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[178px]">
      <Frame10 />
      <Frame11 />
    </div>
  );
}

function Frame14() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[16px] items-start px-[24px] py-[16px] relative size-full">
        <div className="bg-[rgba(179,179,253,0.3)] relative rounded-[24px] shrink-0 w-full" data-name="HabitCard">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center justify-between px-[21px] py-[17px] relative size-full">
              <Card />
              <HabitProfile />
              <Frame13 />
              <div className="bg-[#a7a7fd] content-stretch flex items-center px-[12px] py-[10px] relative rounded-[48px] shrink-0" data-name="Button">
                <div className="relative shrink-0 size-[16px]" data-name="Property 1=disabled">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                    <path d={svgPaths.p3ed50f00} fill="var(--fill-0, #474747)" id="Union" />
                  </svg>
                </div>
              </div>
              <div className="-translate-y-1/2 absolute flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] right-[62px] text-[10px] text-black top-[17px] translate-x-full whitespace-nowrap">
                <p className="leading-[20px]">3/2 удаа</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[rgba(255,200,200,0.3)] relative rounded-[24px] shrink-0 w-full" data-name="HabitCard">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center justify-between px-[21px] py-[17px] relative size-full">
              <Card1 />
              <Frame5 />
              <Frame15 />
              <div className="bg-[#fbb] content-stretch flex items-center px-[12px] py-[10px] relative rounded-[48px] shrink-0" data-name="Button">
                <div className="relative shrink-0 size-[16px]" data-name="Property 1=disabled">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                    <path d={svgPaths.p3ed50f00} fill="var(--fill-0, #474747)" id="Union" />
                  </svg>
                </div>
              </div>
              <div className="-translate-y-1/2 absolute flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] left-[276px] text-[10px] text-black top-[17px] whitespace-nowrap">
                <p className="leading-[20px]">10/8 минут</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[rgba(179,255,199,0.3)] relative rounded-[24px] shrink-0 w-full" data-name="HabitCard">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center justify-between px-[21px] py-[17px] relative size-full">
              <Card2 />
              <HabitProfile1 />
              <Frame16 />
              <div className="bg-[#94fdb0] content-stretch flex items-center px-[12px] py-[10px] relative rounded-[48px] shrink-0" data-name="Button">
                <div className="relative shrink-0 size-[16px]" data-name="Property 1=disabled">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                    <path d={svgPaths.p3ed50f00} fill="var(--fill-0, #474747)" id="Union" />
                  </svg>
                </div>
              </div>
              <div className="-translate-y-1/2 absolute flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] right-[62px] text-[10px] text-black top-[17px] translate-x-full whitespace-nowrap">
                <p className="leading-[20px]">0/2 удаа</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[rgba(179,252,255,0.3)] relative rounded-[24px] shrink-0 w-full" data-name="HabitCard">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center justify-between px-[21px] py-[17px] relative size-full">
              <Card3 />
              <HabitProfile2 />
              <Frame17 />
              <div className="bg-[#dee061] content-stretch flex gap-[8px] items-center relative rounded-[48px] shrink-0" data-name="Button">
                <div className="h-[42px] relative shrink-0 w-[43px]" data-name="Union">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 43 42">
                    <path d={svgPaths.p3c807200} fill="var(--fill-0, #FFD500)" id="Union" />
                  </svg>
                </div>
                <div className="absolute h-[15px] left-[14px] overflow-clip top-[13px] w-[17px]" data-name="Property 1=default">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 15">
                    <path d={svgPaths.pd256a80} fill="var(--fill-0, black)" id="Union" />
                  </svg>
                </div>
              </div>
              <div className="-translate-y-1/2 absolute flex flex-col font-['Montserrat:Regular',sans-serif] font-normal justify-center leading-[0] right-[62px] text-[10px] text-black top-[17px] translate-x-full whitespace-nowrap">
                <p className="leading-[20px]">1/1 удаа</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[24px]">
      <div className="h-[20.528px] relative shrink-0 w-[20.98px]" data-name="homeIcon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.9795 20.5279">
          <path clipRule="evenodd" d={svgPaths.p32b44f70} fill="var(--fill-0, #F2F4F5)" fillRule="evenodd" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function HiconLinearSwitches() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip px-px py-[2px] relative shrink-0 size-[24px]" data-name="Hicon / Linear / Switches">
      <div className="h-[18.817px] relative shrink-0 w-full" data-name="statisticIcon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 18.8174">
          <g id="Union">
            <path d={svgPaths.pacd1080} fill="var(--fill-0, #474747)" />
            <path d={svgPaths.pd0d600} fill="var(--fill-0, #474747)" />
            <path d={svgPaths.p390fed00} fill="var(--fill-0, #474747)" />
            <path d={svgPaths.p2b82e140} fill="var(--fill-0, #474747)" />
            <path d={svgPaths.p3a136ab0} fill="var(--fill-0, #474747)" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function HiconLinearBooks() {
  return (
    <div className="content-stretch flex h-[24px] items-center overflow-clip px-[4px] py-px relative shrink-0" data-name="Hicon / Linear / Books">
      <div className="h-[21.048px] relative shrink-0 w-[17px]" data-name="learnIcon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 21.0479">
          <path d={svgPaths.p1be6cf80} fill="var(--fill-0, #474747)" id="Union" />
        </svg>
      </div>
    </div>
  );
}

function HiconLinearProfile() {
  return (
    <div className="content-stretch flex h-[24px] items-center overflow-clip px-[5px] py-[2px] relative shrink-0" data-name="Hicon / Linear / Profile 1">
      <div className="h-[20.75px] relative shrink-0 w-[16.074px]" data-name="Notification">
        <div className="absolute inset-[-3.61%_-4.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5745 22.25">
            <path d={svgPaths.p3ba62700} id="Vector" stroke="var(--stroke-0, #474747)" strokeLinecap="round" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="absolute inset-[9.64%_5.54%_71.08%_69.57%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
            <path d={svgPaths.p2d5a3780} fill="var(--fill-0, #474747)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icons() {
  return (
    <div className="content-stretch flex gap-[32px] items-center relative shrink-0 w-[307px]" data-name="Icons">
      <div className="bg-[#303437] content-stretch flex gap-[8px] items-center pl-[12px] pr-[20px] py-[10px] relative rounded-[48px] shrink-0" data-name="Button">
        <Frame12 />
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#f2f4f5] text-[14px] whitespace-nowrap">
          <p className="leading-[20px]">Гэр</p>
        </div>
      </div>
      <HiconLinearSwitches />
      <HiconLinearBooks />
      <HiconLinearProfile />
    </div>
  );
}

export default function IPhone() {
  return (
    <div className="bg-[#f7fcff] content-stretch flex flex-col items-center relative size-full" data-name="iPhone 16 - 1">
      <Frame18 />
      <Frame14 />
      <div className="absolute bg-white content-stretch flex flex-col items-center justify-center left-[20px] py-[10px] rounded-[24px] shadow-[10px_14px_56px_0px_rgba(0,0,0,0.12)] top-[776px] w-[354px]" data-name="Bottom Nav Bar">
        <Icons />
      </div>
    </div>
  );
}