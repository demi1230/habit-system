import svgPaths from "./svg-qy4llpws4m";

function Calendar() {
  return (
    <div className="content-stretch flex items-center px-[24px] py-[10px] relative shrink-0 w-[393px]" data-name="Calendar">
      <div className="flex flex-[1_0_0] flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center leading-[0] min-h-px min-w-px relative text-[#202325] text-[14px]">
        <p className="leading-[20px]">Сануулгууд</p>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex font-['Montserrat:Regular',sans-serif] font-normal items-start justify-between relative shrink-0 text-black w-full">
      <div className="flex flex-col justify-center relative shrink-0 w-[189px]">
        <p className="leading-[16px]">Ажлаа хийх гээд суух үйлдлийг хийхээсээ өмнө өдрийн ажлаа төлөх</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 whitespace-nowrap">
        <p className="leading-[16px]">2026.03.05</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-[#e3ebfe] content-stretch flex flex-col gap-[4px] items-start leading-[0] px-[16px] py-[12px] relative rounded-[24px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.07)] shrink-0 text-[14px] w-[351px]">
      <div className="flex flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center relative shrink-0 text-[#303437] whitespace-nowrap">
        <p className="leading-[24px]">Өдрийн ажлаа төлөвлөх</p>
      </div>
      <Frame3 />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute bg-[#f7fcff] content-stretch flex flex-col gap-[10px] items-start left-0 pt-[60px] top-0">
      <Calendar />
      <Frame2 />
    </div>
  );
}

function HiconLinearSwitches() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip px-px py-[2px] relative shrink-0 size-[24px]" data-name="Hicon / Linear / Switches">
      <div className="relative shrink-0 size-[21px]" data-name="homeIcon">
        <div className="absolute inset-[-3.57%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.5 22.5">
            <path d={svgPaths.p21665500} fill="var(--stroke-0, #474747)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function HiconLinearSwitches1() {
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

function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[24px]">
      <div className="h-[20.75px] relative shrink-0 w-[16.074px]" data-name="Notification">
        <div className="absolute inset-[-3.61%_-4.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.5745 22.25">
            <path d={svgPaths.p3ba62700} id="Vector" stroke="var(--stroke-0, #F2F4F5)" strokeLinecap="round" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="absolute inset-[9.64%_5.54%_71.08%_69.57%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
            <path d={svgPaths.p2d5a3780} fill="var(--fill-0, #F2F4F5)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icons() {
  return (
    <div className="content-stretch flex gap-[32px] items-center relative shrink-0 w-[307px]" data-name="Icons">
      <HiconLinearSwitches />
      <HiconLinearSwitches1 />
      <HiconLinearBooks />
      <div className="bg-[#303437] content-stretch flex gap-[8px] items-center pl-[12px] pr-[20px] py-[10px] relative rounded-[48px] shrink-0" data-name="Button">
        <Frame1 />
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#f2f4f5] text-[14px] whitespace-nowrap">
          <p className="leading-[20px]">Мэдэгдэл</p>
        </div>
      </div>
    </div>
  );
}

export default function IPhone() {
  return (
    <div className="bg-[#f7fcff] relative size-full" data-name="iPhone 16 - 4">
      <Frame />
      <div className="absolute bg-white content-stretch flex flex-col items-center justify-center left-[22px] py-[10px] rounded-[24px] shadow-[10px_14px_56px_0px_rgba(0,0,0,0.12)] top-[774px] w-[354px]" data-name="Bottom Nav Bar">
        <Icons />
      </div>
    </div>
  );
}