import svgPaths from "./svg-spd1vtracf";
import imgHabitProfile from "./e26e9fe797c0ed6d681176a232f8c863a5c32ba4.png";
import imgHabitProfile1 from "./9ac9c858bbb4631dccd112b2c0479cf4e738c6ac.png";
import imgHabitProfile2 from "./28c5d348b2b940f2c4855e0f432355bcc547b5e2.png";

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

function Frame1() {
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

function Frame() {
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

function Frame9() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[178px]">
      <Frame1 />
      <Frame />
    </div>
  );
}

function Card1() {
  return <div className="absolute bg-[rgba(255,187,187,0.6)] h-[99px] left-0 rounded-[24px] top-0 w-[275px]" data-name="Card" />;
}

function Frame2() {
  return (
    <div className="bg-[rgba(0,0,0,0.1)] content-stretch flex items-start overflow-clip p-[10px] relative rounded-[24px] shrink-0">
      <div className="flex flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[24px] text-black whitespace-nowrap">
        <p className="leading-[24px]">🙆‍♀️</p>
      </div>
    </div>
  );
}

function Frame3() {
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

function Frame4() {
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

function Frame11() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[178px]">
      <Frame3 />
      <Frame4 />
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

function Frame5() {
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

function Frame6() {
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

function Frame12() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[178px]">
      <Frame5 />
      <Frame6 />
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

function Frame7() {
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

function Frame8() {
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

function Frame13() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[178px]">
      <Frame7 />
      <Frame8 />
    </div>
  );
}

export default function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start px-[24px] py-[16px] relative size-full">
      <div className="bg-[rgba(179,179,253,0.3)] relative rounded-[24px] shrink-0 w-full" data-name="HabitCard">
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[21px] py-[17px] relative size-full">
            <Card />
            <HabitProfile />
            <Frame9 />
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
            <Frame2 />
            <Frame11 />
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
            <Frame12 />
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
            <Frame13 />
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
  );
}