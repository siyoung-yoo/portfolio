/**
 * Custom Select Box Component
 *
 * 사용법:
 * <form-select>
 *   <select>
 *     <option value="1">Option 1</option>
 *     <option value="2">Option 2</option>
 *   </select>
 * </form-select>
 *
 * 다중 선택:
 * <form-select multi>
 *   <select multiple>
 *     <option value="A">Item A</option>
 *   </select>
 * </form-select>
 *
 * 단일 선택 + 검색 기능:
 * <form-select searchable>
 *   <select>
 *     <option value="1">Option 1</option>
 *   </select>
 * </form-select>
 *
 * HTML 지원 (단일 선택만 가능):
 * (option[hidden] 리스트에 노출 안됨)
 * <form-select allow-html>
 *   <select>
 *     <option hidden>리스트에 노출 X</option>
 *     <option value="1"><div>Option 1</div></option>
 *     <option value="2"><div>Option 2</div></option>
 *   </select>
 * </form-select>
 *
 * JavaScript API:
 * const selectEl = document.querySelector('form-select');
 *
 * // 값 설정 (단일)
 * selectEl.setValue('A');
 * // 값 설정 (다중)
 * selectEl.setValue(['A', 'B', 'C']);
 *
 * // 옵션 추가 (단일)
 * selectEl.addOption('D', '항목 D');
 * // 옵션 추가 (여러 개)
 * selectEl.addOptions([
 *   {value: 'E', text: '항목 E'},
 *   {value: 'F', text: '항목 F'}
 * ]);
 *
 * // 옵션 전체 교체
 * selectEl.setOptions([
 *   {value: '1', text: '옵션 1'},
 *   {value: '2', text: '옵션 2'}
 * ]);
 *
 * // 셀렉트박스 드랍다운 위로 표시
 * <form-select portal>
 *   <select ~~~ />
 * </form-select>
 *
 */

class SelectBox extends HTMLElement {
  // ============================================
  // Lifecycle Methods
  // ============================================

  constructor() {
    super();
    this.selectedValues = [];
    this.options = [];
    this.isMulti = this.hasAttribute('multi');
    this.isSearchable = this.hasAttribute('searchable');
    this.allowHTML = this.hasAttribute('allow-html');

    //  opt-in: <form-select portal> 일 때만 dropdown을 body로 포탈 이동
    // 모달(.modal) 내부에 있으면 자동으로 portal 활성화
    this.usePortal = this.hasAttribute('portal');

    this._portal = {
      active: false,
      placeholder: null,
    };
    this._onReposition = null;
  }

  connectedCallback() {
    this.originalSelect = this.querySelector('select');
    if (!this.originalSelect) {
      return;
    }
    if (this.originalSelect.hasAttribute('multiple')) {
      this.isMulti = true;
    }
    if (this.originalSelect.hasAttribute('searchable')) {
      this.isSearchable = true;
    }

    // 모달(.modal) 내부에 있으면 자동으로 portal 활성화
    if (!this.usePortal && this.closest('.modal')) {
      this.usePortal = true;
    }

    this.render();
    this.collectOptions();
    this.renderOptions();
    this.bindEvents();
    this.setInitialValues();

    // disabled 상태 반영
    if (this.originalSelect.disabled) {
      this.setDisabled(true);
    }

    this.originalSelect.style.display = 'none';
  }

  // ============================================
  // Rendering & DOM Methods
  // ============================================

  render() {
    const template = document.getElementById('selectBox');
    if (template) {
      const content = template.content.cloneNode(true);
      this.customSelect = content.querySelector('.custom-select');
    } else {
      this.customSelect = this.createSelectElement();
    }

    if (this.isMulti) {
      this.customSelect.setAttribute('multi', '');
    }

    if (this.isSearchable) {
      this.customSelect.setAttribute('searchable', '');
    }

    this.trigger = this.customSelect.querySelector('.custom-select-trigger');
    this.input = this.customSelect.querySelector('.custom-select-input');
    this.dropdown = this.customSelect.querySelector('.custom-select-dropdown');
    this.searchInput = this.customSelect.querySelector('.custom-select-search-input');
    this.optionsContainer = this.customSelect.querySelector('.custom-select-options');

    if (this.isMulti && this.usePortal) {
      this.dropdown.classList.add('multi');
    }
    if (this.isSearchable && this.usePortal) {
      this.dropdown.classList.add('searchable');
    }

    this.customSelect._instance = this;
    this.appendChild(this.customSelect);
  }

  createSelectElement() {
    const div = document.createElement('div');
    div.className = 'custom-select';

    if (this.allowHTML) {
      div.innerHTML = `
        <div class="custom-select-trigger">
          <div class="custom-select-input" data-placeholder="선택"></div>
          <i class="icon-chevron custom-select-arrow"></i>
        </div>
        <div class="custom-select-dropdown">
          <div class="custom-select-search">
            <input type="text" class="custom-select-search-input" placeholder="검색">
          </div>
          <div class="custom-select-options"></div>
        </div>
      `;
    } else {
      div.innerHTML = `
        <div class="custom-select-trigger">
          <input type="text" class="custom-select-input" readonly placeholder="선택">
          <i class="icon-chevron custom-select-arrow"></i>
        </div>
        <div class="custom-select-dropdown">
          <div class="custom-select-search">
            <input type="text" class="custom-select-search-input" placeholder="검색">
          </div>
          <div class="custom-select-options"></div>
        </div>
      `;
    }
    return div;
  }

  collectOptions() {
    const optionElements = this.originalSelect.querySelectorAll('option');
    this.options = Array.from(optionElements).map(option => ({
      value: option.value,
      text: option.textContent,
      html: option.innerHTML,
      hidden: option.hidden,
      selected: option.selected
    }));
  }

  renderOptions(filter = '') {
    this.optionsContainer.innerHTML = '';

    const filteredOptions = this.options.filter(option =>
      !option.hidden && option.text.toLowerCase().includes(filter.toLowerCase())
    );

    filteredOptions.forEach(option => {
      const optionElement = document.createElement('div');
      optionElement.className = 'custom-select-option';
      optionElement.dataset.value = option.value;

      if (this.isMulti) {
        const checkbox = document.createElement('div');
        checkbox.className = 'custom-select-checkbox';
        if (this.selectedValues.includes(option.value)) {
          checkbox.classList.add('checked');
          optionElement.classList.add('selected');
        }
        optionElement.appendChild(checkbox);
      } else {
        if (this.selectedValues.includes(option.value)) {
          optionElement.classList.add('selected');
        }
      }

      const textSpan = document.createElement('span');
      textSpan.className = 'custom-select-option-text';
      if (this.allowHTML) {
        textSpan.innerHTML = option.html;
      } else {
        textSpan.textContent = option.text;
      }
      optionElement.appendChild(textSpan);


      optionElement.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectOption(option.value);
      });

      this.optionsContainer.appendChild(optionElement);
    });
  }

  selectOption(value) {
    if (this.isMulti) {
      // 다중 선택
      const index = this.selectedValues.indexOf(value);
      if (index > -1) {
        this.selectedValues.splice(index, 1);
      } else {
        this.selectedValues.push(value);
      }

      const optionElement = this.optionsContainer.querySelector(`.custom-select-option[data-value="${value}"]`);
      if (optionElement) {
        const checkbox = optionElement.querySelector('.custom-select-checkbox');
        const isSelected = this.selectedValues.includes(value);

        if (isSelected) {
          optionElement.classList.add('selected');
          if (checkbox) checkbox.classList.add('checked');
        } else {
          optionElement.classList.remove('selected');
          if (checkbox) checkbox.classList.remove('checked');
        }
      }

      this.updateInputDisplay();
      this.updateOriginalSelect();

      if (this.searchInput) {
        setTimeout(() => this.searchInput.focus(), 0);
      }
    } else {
      // 단일 선택
      this.selectedValues = [value];
      this.updateInputDisplay();
      this.updateOriginalSelect();
      this.close();
    }
  }

  // ============================================
  // State Management
  // ============================================

  updateInputDisplay() {
    if (this.selectedValues.length === 0) {
      if (this.allowHTML) {
        this.input.innerHTML = '';
        this.input.dataset.placeholder = '선택';
      } else {
        this.input.value = '';
        this.input.placeholder = '선택';
      }
      return;
    }

    const selectedOptions = this.options.filter(option =>
      this.selectedValues.includes(option.value)
    );

    if (this.isMulti) {
      // 다중 선택
      // const displayText = selectedTexts.join(', ');
      // this.input.value = displayText;
      // this.input.title = displayText;

      const text = selectedOptions.map(o => o.text).join(', ');
      this.input.value = text;
      this.input.title = text;
    } else {
      // 단일 선택
      if (this.allowHTML) {
        this.input.innerHTML = selectedOptions[0]?.html || '';
      } else {
        this.input.value = selectedOptions[0]?.text || '';
      }
    }
  }

  updateOriginalSelect() {
    const options = this.originalSelect.querySelectorAll('option');
    options.forEach(option => {
      option.selected = this.selectedValues.includes(option.value);
    });

    this.originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  setInitialValues() {
    const selectedOptions = this.originalSelect.querySelectorAll('option:checked');
    this.selectedValues = Array.from(selectedOptions).map(option => option.value);
    this.updateInputDisplay();
  }

  // ============================================
  // Event Handling
  // ============================================

  bindEvents() {
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation(); // 전역 핸들러로 전파 방지
      this.toggle();
    });

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.renderOptions(e.target.value);
      });
    }
  }

  // ============================================
  // Portal helpers (opt-in)
  // ============================================

  repositionDropdown() {
    if (!this._portal.active) return;

    const rect = this.trigger.getBoundingClientRect();

    // dropdown을 일단 보이게 해두고 높이 측정
    // (display는 enablePortal에서 block 켠다는 전제)
    this.dropdown.style.position = 'fixed';
    this.dropdown.style.left = rect.left + 'px';
    this.dropdown.style.width = rect.width + 'px';
    this.dropdown.style.zIndex = '99999';

    const margin = 8; // 화면 여백
    const vh = window.innerHeight;

    const spaceBelow = vh - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    // dropdown이 원하는 높이(내용 높이) 측정
    // 스크롤 높이 기준이 가장 정확
    const desiredH = Math.min(this.dropdown.scrollHeight, vh - margin * 2);

    //  전략: 아래 공간이 충분하면 아래로, 아니면 위로, 둘다 부족하면 더 넓은 쪽으로
    let openUp = false;

    if (spaceBelow >= desiredH) {
      openUp = false; // 아래로 충분
    } else if (spaceAbove >= desiredH) {
      openUp = true;  // 위로 충분
    } else {
      // 둘 다 부족 → 더 넓은 쪽으로
      openUp = spaceAbove > spaceBelow;
    }

    if (openUp) {
      // 위로 열기: dropdown bottom을 trigger top에 맞춤
      const maxH = Math.max(120, spaceAbove);
      this.dropdown.style.maxHeight = maxH + 'px';
      this.dropdown.style.overflowY = 'auto';
      this.dropdown.style.top = Math.max(margin, rect.top - Math.min(desiredH, maxH)) + 'px';
    } else {
      // 아래로 열기
      const maxH = Math.max(120, spaceBelow);
      this.dropdown.style.maxHeight = maxH + 'px';
      this.dropdown.style.overflowY = 'auto';
      this.dropdown.style.top = rect.bottom + 'px';
    }
  }


  enablePortal() {
    if (!this.usePortal || this._portal.active) return;

    this._portal.active = true;

    // 원래 위치를 기억하기 위한 placeholder
    this._portal.placeholder = document.createComment('dropdown-placeholder');
    this.customSelect.insertBefore(this._portal.placeholder, this.dropdown);

    // dropdown을 body로 이동
    document.body.appendChild(this.dropdown);
    this.dropdown.style.display = 'block';
    // 위치 세팅
    this.repositionDropdown();

    // 스크롤/리사이즈 시 위치 재계산, trigger가 화면 밖이면 닫기
    this._onReposition = () => {
      const rect = this.trigger.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight ||
          rect.right < 0 || rect.left > window.innerWidth) {
        this.close();
        return;
      }
      this.repositionDropdown();
    };
    window.addEventListener('scroll', this._onReposition, true);
    window.addEventListener('resize', this._onReposition);
  }

  disablePortal() {
    if (!this.usePortal || !this._portal.active) return;

    this._portal.active = false;

    window.removeEventListener('scroll', this._onReposition, true);
    window.removeEventListener('resize', this._onReposition);
    this._onReposition = null;

    // dropdown 원복
    const ph = this._portal.placeholder;
    if (ph && ph.parentNode) {
      ph.parentNode.insertBefore(this.dropdown, ph);
      ph.remove();
    } else {
      this.customSelect.appendChild(this.dropdown);
    }

    // 스타일 초기화
    this.dropdown.style.position = '';
    this.dropdown.style.left = '';
    this.dropdown.style.top = '';
    this.dropdown.style.width = '';
    this.dropdown.style.maxHeight = '';
    this.dropdown.style.overflowY = '';
    this.dropdown.style.zIndex = '';
    this.dropdown.style.display = '';
    this._portal.placeholder = null;
  }

  // ============================================
  // Dropdown Control
  // ============================================

  toggle() {
    if (this.customSelect.classList.contains('open')) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this._justOpened = true;

    document.querySelectorAll('.custom-select.open').forEach(select => {
      if (select !== this.customSelect && select._instance) {
        select._instance.close();
      }
    });

    this.customSelect.classList.add('open');

    //  portal opt-in
    this.enablePortal();

    setTimeout(() => {
      this._justOpened = false;
    }, 0);

    if ((this.isMulti || this.isSearchable) && this.searchInput) {
      setTimeout(() => {
        this.searchInput.focus();
      }, 100);
    }
  }

  close() {
    this.customSelect.classList.remove('open');

    if (this.searchInput) {
      this.searchInput.value = '';
      this.renderOptions();
    }

    //  portal opt-in
    this.disablePortal();
  }

  // ============================================
  // Public API Methods
  // ============================================

  // 값 설정
  setValue(value) {
    if (this.isMulti) {
      this.selectedValues = Array.isArray(value) ? value : [value];
    } else {
      this.selectedValues = [value];
    }
    this.renderOptions();
    this.updateInputDisplay();
    this.updateOriginalSelect();
  }

  // 값 가져오기
  getValue() {
    return this.isMulti ? this.selectedValues : (this.selectedValues[0] || null);
  }

  // 옵션 추가 (단일)
  addOption(value, text) {
    this.options.push({ value, text, selected: false });

    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    this.originalSelect.appendChild(option);

    this.renderOptions(this.searchInput?.value || '');
  }

  // 옵션 여러 개 추가
  addOptions(optionsArray) {
    optionsArray.forEach(opt => {
      this.options.push({ value: opt.value, text: opt.text, selected: false });

      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      this.originalSelect.appendChild(option);
    });

    this.renderOptions(this.searchInput?.value || '');
  }

  // 옵션 제거
  removeOption(value) {
    this.options = this.options.filter(option => option.value !== value);

    const option = this.originalSelect.querySelector(`option[value="${value}"]`);
    if (option) {
      option.remove();
    }

    const index = this.selectedValues.indexOf(value);
    if (index > -1) {
      this.selectedValues.splice(index, 1);
      this.updateInputDisplay();
      this.updateOriginalSelect();
    }

    this.renderOptions(this.searchInput?.value || '');
  }

  // 선택 초기화
  clear() {
    this.selectedValues = [];
    this.renderOptions(this.searchInput?.value || '');
    this.updateInputDisplay();
    this.updateOriginalSelect();
  }

  // 모든 옵션 초기화
  clearOptions() {
    this.options = [];
    this.selectedValues = [];
    this.originalSelect.innerHTML = '';
    this.renderOptions();
    this.updateInputDisplay();
  }

  // 옵션 전체 교체
  setOptions(optionsArray) {
    this.clearOptions();
    this.addOptions(optionsArray);
  }

  // 비활성화/활성화
  setDisabled(disabled) {
    if (disabled) {
      this.customSelect.style.pointerEvents = 'none';
      this.customSelect.style.opacity = '0.6';
      this.originalSelect.disabled = true;
    } else {
      this.customSelect.style.pointerEvents = '';
      this.customSelect.style.opacity = '';
      this.originalSelect.disabled = false;
    }
  }
}

customElements.define('form-select', SelectBox);

let globalEventsInitialized = false;

function initGlobalEvents() {
  if (globalEventsInitialized) return;
  globalEventsInitialized = true;

  //  portal 포함 공통: trigger/dropdown 내부 클릭은 무시, 외부 클릭만 close
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.custom-select.open').forEach(select => {
      const instance = select._instance;
      if (!instance) return;

      if (instance._justOpened) return;

      const inTrigger = instance.trigger.contains(e.target);
      const inDropdown = instance.dropdown.contains(e.target);

      if (inTrigger || inDropdown) return;

      instance.close();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobalEvents);
} else {
  initGlobalEvents();
}

window.SelectBox = SelectBox;






/**
 * Custom Dropdown Component
 *
 * 사용법:
 * <form-dropdown label="버튼명">
 *    <button type="button" class="dropdown-item">옵션 1</button>
 *    <button type="button" class="dropdown-item">옵션 2</button>
 *    <button type="button" class="dropdown-item">옵션 3</button>
 * </form-dropdown>
 *
 * 체크박스가 있을 경우:
 * <form-dropdown label="버튼명">
 *   <label class="flex items-center gap-2 dropdown-item">
 *      <input type="checkbox" class="checkbox">전체
 *   </label>
 *   <label class="flex items-center gap-2 dropdown-item">
 *       <input type="checkbox" class="checkbox">옵션1
 *    </label>
 * </form-dropdown>
 *
 * 버튼이 이미지일 경우:
 * <form-dropdown icon="https://dummyimage.com/25x25/000/fff">
 *    <button class="dropdown-item">옵션 1</button>
 *    <button class="dropdown-item">옵션 2</button>
 *  </form-dropdown>
 *
 *  버튼이 inline SVG 인 경우:
 *  <form-dropdown>
 *    <button slot="trigger" class="btn">
 *       <svg></svg>
 *    </button>
 *
 *    <button type="button" class="dropdown-item">옵션 1</button>
 *    <button type="button" class="dropdown-item">옵션2</button>
 * </form-dropdown>
 **/

class FormDropdown extends HTMLElement {
  static instances = new Set();
  static documentBound = false;

  constructor() {
    super();

    this.isOpen = false;
    this.popperInstance = null;

    this.onToggleClick = this.onToggleClick.bind(this);
    this.onDocumentClick = this.onDocumentClick.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
  }

  connectedCallback() {
    this.render();
    this.cacheElements();
    this.bindEvents();

    FormDropdown.instances.add(this);
    FormDropdown.bindDocumentEvents();
  }

  render() {
    const label = this.getAttribute('label');
    const icon = this.getAttribute('icon');

    const items = Array.from(this.querySelectorAll('.dropdown-item'));
    const customTrigger = this.querySelector('[slot="trigger"]');

    const wrapper = document.createElement('div');
    wrapper.className = 'dropdown';
    wrapper.dataset.dropdown = '';

    // ---------- Toggle (Trigger) ----------
    let toggle;

    if (customTrigger) {
      toggle = customTrigger.cloneNode(true);

    } else {
      toggle = document.createElement('button');
      toggle.type = 'button';

      if (icon) {
        const img = document.createElement('img');
        toggle.className = 'btn';
        img.src = icon;
        img.alt = label || '드롭다운 버튼';

        toggle.appendChild(img);

      } else if (label) {
        toggle.className = 'btn btn-dropdown';
        toggle.textContent = label;
      }
    }

    toggle.dataset.dropdownToggle = '';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-haspopup', 'true');

    // ---------- Menu ----------
    const menu = document.createElement('ul');
    menu.className = 'dropdown-menu';

    items.forEach(item => {
      const li = document.createElement('li');
      li.appendChild(item.cloneNode(true));
      menu.appendChild(li);
    });

    wrapper.append(toggle, menu);

    this.innerHTML = '';
    this.appendChild(wrapper);
  }

  cacheElements() {
    this.root = this.querySelector('.dropdown');
    this.toggle = this.root.querySelector('[data-dropdown-toggle]');
    this.menu = this.root.querySelector('.dropdown-menu');
  }

  bindEvents() {
    this.toggle.addEventListener('click', this.onToggleClick);
    this.toggle.addEventListener('keydown', this.onKeydown);

    this.menu.addEventListener('click', e => {
      const item = e.target.closest('.dropdown-item');
      if (!item) return;

      if (item.querySelector('input[type="checkbox"]')) return;

      this.close();
    });
  }

  onToggleClick(e) {
    e.stopPropagation();

    if (this.isOpen) {
      this.close();
    } else {
      FormDropdown.closeAll(this);
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.toggle.setAttribute('aria-expanded', 'true');

    document.body.appendChild(this.menu);
    this.menu.classList.add('show');
    this.createPopper();
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.toggle.setAttribute('aria-expanded', 'false');
    this.menu.classList.remove('show');

    this.destroyPopper();
    this.root.appendChild(this.menu);
  }

  createPopper() {
    if (this.popperInstance) return;

    this.popperInstance = Popper.createPopper(
      this.toggle,
      this.menu,
      {
        placement: 'bottom-start',
        strategy: 'fixed',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 6], // 버튼과 간격
            },
          },
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['top-start', 'right-start', 'left-start'],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              padding: 8,
            },
          },
        ],
      }
    );
  }

  destroyPopper() {
    if (!this.popperInstance) return;

    this.popperInstance.destroy();
    this.popperInstance = null;
  }

  updateDirection() {
    this.menu.style.top = '100%';
    this.menu.style.bottom = 'auto';
    this.menu.style.left = '0';
    this.menu.style.right = 'auto';

    this.menu.offsetHeight;

    const menuRect = this.menu.getBoundingClientRect();
    const toggleRect = this.toggle.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    if (toggleRect.bottom + menuRect.height > vh) {
      this.menu.style.top = 'auto';
      this.menu.style.bottom = '100%';
    }

    if (menuRect.right > vw) {
      this.menu.style.left = 'auto';
      this.menu.style.right = '0';
    }
  }

  onDocumentClick(e) {
    if (!this.contains(e.target)) {
      this.close();
    }
  }

  onKeydown(e) {
    if (e.key === 'Escape') {
      this.close();
      this.toggle.focus();
    }
  }

  static closeAll(except) {
    this.instances.forEach(instance => {
      if (instance !== except) instance.close();
    });
  }

  static bindDocumentEvents() {
    if (this.documentBound) return;

    document.addEventListener('click', e => {
      this.instances.forEach(instance =>
        instance.onDocumentClick(e)
      );
    });

    document.addEventListener('keydown', e => {
      this.instances.forEach(instance =>
        instance.onKeydown(e)
      );
    });

    this.documentBound = true;
  }

  repositionDropdown() {
    if (!this._portal.active) return;

    const rect = this.trigger.getBoundingClientRect();

    this.dropdown.style.position = 'fixed';
    this.dropdown.style.left = rect.left + 'px';
    this.dropdown.style.top = rect.bottom + 'px';
    this.dropdown.style.width = rect.width + 'px';

    const vh = window.innerHeight;
    const maxH = Math.max(120, vh - rect.bottom - 12);
    this.dropdown.style.maxHeight = maxH + 'px';
    this.dropdown.style.overflowY = 'auto';

    this.dropdown.style.zIndex = '99999';
  }

}

customElements.define('form-dropdown', FormDropdown);
