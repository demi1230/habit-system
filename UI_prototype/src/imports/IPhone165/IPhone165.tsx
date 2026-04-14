import svgPaths from "./svg-6bzktrev3b";

function Frame() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative">
      <div className="flex flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#202325] text-[14px] w-full">
        <p className="leading-[20px]">Дадлын нэр</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
      <button className="block cursor-pointer h-[8.753px] overflow-clip relative shrink-0 w-[18.026px]" data-name="arrowIcon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.0264 8.75297">
          <path d={svgPaths.p35bd8200} fill="var(--fill-0, #474747)" id="Union" />
        </svg>
      </button>
      <Frame />
      <div className="bg-[#dadafe] content-stretch flex h-[28px] items-center px-[12px] py-[10px] relative rounded-[48px] shrink-0" data-name="Button">
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#232323] text-[12px] whitespace-nowrap">
          <p className="leading-[20px]">өнгө</p>
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute bg-[#f7fcff] content-stretch flex flex-col items-start left-[-1px] pt-[60px] px-[24px] top-0 w-[393px]">
      <Frame2 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[21px] items-center relative shrink-0 w-full">
      <div className="bg-[rgba(179,179,253,0.49)] content-stretch flex flex-col items-center justify-center p-[4px] relative rounded-[24px] shrink-0 w-[28px]" data-name="CalendarCell">
        <div className="flex flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.6)] text-center whitespace-nowrap">
          <p className="leading-[20px]">Да</p>
        </div>
      </div>
      <div className="bg-[rgba(179,179,253,0.49)] content-stretch flex flex-col items-center justify-center p-[4px] relative rounded-[24px] shrink-0 w-[28px]" data-name="CalendarCell">
        <div className="flex flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.6)] text-center whitespace-nowrap">
          <p className="leading-[20px]">Мя</p>
        </div>
      </div>
      <div className="bg-[rgba(179,179,253,0.49)] content-stretch flex flex-col items-center justify-center p-[4px] relative rounded-[24px] shrink-0 w-[28px]" data-name="CalendarCell">
        <div className="flex flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.6)] text-center whitespace-nowrap">
          <p className="leading-[20px]">Лх</p>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative shrink-0" data-name="CalendarCell">
        <div className="flex flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.6)] text-center whitespace-nowrap">
          <p className="leading-[20px]">Пү</p>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative shrink-0" data-name="CalendarCell">
        <div className="flex flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.6)] text-center whitespace-nowrap">
          <p className="leading-[20px]">Ба</p>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative shrink-0" data-name="CalendarCell">
        <div className="flex flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.6)] text-center whitespace-nowrap">
          <p className="leading-[20px]">Бя</p>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-center justify-center p-[4px] relative shrink-0" data-name="CalendarCell">
        <div className="flex flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[12px] text-[rgba(0,0,0,0.6)] text-center whitespace-nowrap">
          <p className="leading-[20px]">Ня</p>
        </div>
      </div>
    </div>
  );
}

function MonthlyCalendar() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[10px] items-start left-[25px] px-[20px] py-[12px] rounded-[24px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.06)] top-[248px] w-[344px]" data-name="MonthlyCalendar">
      <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
        <p className="leading-[24px]">Өдөр</p>
      </div>
      <Frame3 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[24px] relative size-full">
          <div className="bg-[rgba(218,218,254,0.25)] content-stretch flex gap-[10px] h-[35px] items-center justify-center overflow-clip p-[10px] relative rounded-[20px] shrink-0 w-[123px]" data-name="HabitTag">
            <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
              <p className="leading-[24px]">1</p>
            </div>
          </div>
          <div className="bg-[rgba(218,218,254,0.25)] content-stretch flex gap-[10px] h-[35px] items-center justify-center overflow-clip p-[10px] relative rounded-[20px] shrink-0 w-[123px]" data-name="HabitTag">
            <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
              <p className="leading-[24px]">удаа</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthlyCalendar1() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[10px] items-start left-[25px] px-[20px] py-[12px] rounded-[24px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.06)] top-[358px] w-[344px]" data-name="MonthlyCalendar">
      <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
        <p className="leading-[24px]">Зорилтот хэмжээ</p>
      </div>
      <Frame4 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[24px] relative size-full">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
            <p className="leading-[24px]">Цаг</p>
          </div>
          <div className="bg-[#dadafe] content-stretch flex items-center p-[8px] relative rounded-[48px] shrink-0" data-name="Button">
            <div className="relative shrink-0 size-[16px]" data-name="Property 1=accent">
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <path d={svgPaths.p3ed50f00} fill="var(--fill-0, #303437)" id="Union" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[24px] relative size-full">
          <div className="bg-[rgba(218,218,254,0.25)] content-stretch flex gap-[10px] h-[35px] items-center justify-center overflow-clip p-[10px] relative rounded-[20px] shrink-0 w-[123px]" data-name="HabitTag">
            <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
              <p className="leading-[24px]">06:00-08:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
      <Frame5 />
      <Frame6 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[24px] relative size-full">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
            <p className="leading-[24px]">Байршил</p>
          </div>
          <div className="bg-[#dadafe] content-stretch flex items-center p-[8px] relative rounded-[48px] shrink-0" data-name="Button">
            <div className="relative shrink-0 size-[16px]" data-name="Property 1=accent">
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <path d={svgPaths.p3ed50f00} fill="var(--fill-0, #303437)" id="Union" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[24px] relative size-full">
          <div className="bg-[rgba(218,218,254,0.25)] content-stretch flex gap-[10px] h-[35px] items-center justify-center overflow-clip p-[10px] relative rounded-[20px] shrink-0 w-[123px]" data-name="HabitTag">
            <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
              <p className="leading-[24px]">Байршил 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
      <Frame9 />
      <Frame10 />
    </div>
  );
}

function MonthlyCalendar2() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[10px] items-start left-[27px] px-[20px] py-[12px] rounded-[24px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.06)] top-[475px] w-[344px]" data-name="MonthlyCalendar">
      <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
        <p className="leading-[24px]">Сануулга</p>
      </div>
      <Frame7 />
      <Frame8 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[24px] relative size-full">
          <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
            <p className="leading-[24px]">Алхам</p>
          </div>
          <div className="bg-[#dadafe] content-stretch flex items-center p-[8px] relative rounded-[48px] shrink-0" data-name="Button">
            <div className="relative shrink-0 size-[16px]" data-name="Property 1=accent">
              <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                <path d={svgPaths.p3ed50f00} fill="var(--fill-0, #303437)" id="Union" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthlyCalendar3() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[10px] items-start left-[27px] px-[20px] py-[12px] rounded-[24px] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.06)] top-[709px] w-[344px]" data-name="MonthlyCalendar">
      <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
        <p className="leading-[24px]">Дадлын жижиглэх</p>
      </div>
      <Frame11 />
    </div>
  );
}

export default function IPhone() {
  return (
    <div className="bg-[#f7fcff] relative size-full" data-name="iPhone 16 - 5">
      <div className="absolute bg-white content-stretch flex gap-[10px] h-[35px] items-center left-[55px] overflow-clip p-[10px] rounded-[20px] top-[96px]" data-name="HabitTag">
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
          <p className="leading-[24px]">Ж/нь: чийрэг хүн болмоор байгаа ...</p>
        </div>
      </div>
      <div className="absolute bg-white content-stretch flex gap-[10px] h-[35px] items-center left-[14px] overflow-clip p-[10px] rounded-[20px] top-[144px]" data-name="HabitTag">
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
          <p className="leading-[24px]">Ж/нь: өглөөний цайгаа уусныхаа ...</p>
        </div>
      </div>
      <div className="absolute bg-white content-stretch flex gap-[10px] h-[35px] items-center left-[calc(75%+16.25px)] overflow-clip p-[10px] rounded-[20px] top-[144px]" data-name="HabitTag">
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
          <p className="leading-[24px]">10 мин</p>
        </div>
      </div>
      <div className="absolute bg-white content-stretch flex gap-[10px] h-[35px] items-center left-[17px] overflow-clip p-[10px] rounded-[20px] top-[192px]" data-name="HabitTag">
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#544a38] text-[12px] whitespace-nowrap">
          <p className="leading-[24px]">гүймээр байна.</p>
        </div>
      </div>
      <div className="absolute bg-[#dadafe] content-stretch flex h-[28px] items-center left-[69px] px-[12px] py-[10px] rounded-[48px] top-[520px]" data-name="Button">
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#232323] text-[12px] whitespace-nowrap">
          <p className="leading-[20px]">өнгө</p>
        </div>
      </div>
      <Frame1 />
      <MonthlyCalendar />
      <MonthlyCalendar1 />
      <MonthlyCalendar2 />
      <MonthlyCalendar3 />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center leading-[0] left-[23px] text-[#202325] text-[14px] top-[113px] whitespace-nowrap">
        <p className="leading-[20px]">{`Би `}</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center leading-[0] left-[calc(75%+14.25px)] text-[#202325] text-[14px] top-[113px] whitespace-nowrap">
        <p className="leading-[20px]">учраас</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Montserrat:SemiBold',sans-serif] font-semibold justify-center leading-[0] left-[calc(50%+62.5px)] text-[#202325] text-[14px] top-[158px] whitespace-nowrap">
        <p className="leading-[20px]">дараа</p>
      </div>
      <div className="absolute bg-[#303437] content-stretch flex items-center left-[calc(25%+59.75px)] px-[12px] py-[10px] rounded-[48px] top-[819px]" data-name="Button">
        <div className="flex flex-col font-['Montserrat:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#f2f4f5] text-[14px] whitespace-nowrap">
          <p className="leading-[20px]">Хадгалах</p>
        </div>
      </div>
    </div>
  );
}