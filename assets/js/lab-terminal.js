(() => {
  const terminals = document.querySelectorAll('[data-lab-terminal]');

  for (const terminal of terminals) {
    const options = [...terminal.querySelectorAll('[data-terminal-option]')];
    const input = terminal.querySelector('[data-terminal-input]');
    const command = terminal.querySelector('[data-terminal-command]');
    const output = terminal.querySelector('[data-terminal-output]');
    if (!options.length || !input || !command || !output) continue;

    let selected = 0;
    const initialMessage = output.textContent.trim();

    function choose(index, moveFocus = false) {
      selected = (index + options.length) % options.length;
      options.forEach((option, optionIndex) => {
        option.classList.toggle('is-selected', optionIndex === selected);
      });
      const option = options[selected];
      command.textContent = option.dataset.command || option.textContent.trim();
      output.textContent = option.dataset.summary || initialMessage;
      if (moveFocus) option.focus({ preventScroll: true });
    }

    function execute(value) {
      const typed = value.trim().toLowerCase().replace(/^\/+/, '');
      if (!typed) {
        options[selected].click();
        return;
      }
      if (typed === 'help' || typed === '?') {
        output.textContent = terminal.dataset.helpMessage || initialMessage;
        command.textContent = 'help';
        input.value = '';
        return;
      }
      if (typed === 'clear') {
        output.textContent = initialMessage;
        command.textContent = 'ls';
        input.value = '';
        return;
      }
      const match = options.find(option =>
        (option.dataset.alias || '').split(',').some(alias => alias.trim() === typed)
      );
      if (match) {
        match.click();
        return;
      }
      output.textContent = `${terminal.dataset.unknownMessage || 'Unknown command'}: ${value.trim()}`;
      command.textContent = typed;
      input.select();
    }

    input.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        choose(selected + (event.key === 'ArrowDown' ? 1 : -1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        execute(input.value);
      } else if (event.key === 'Escape') {
        input.value = '';
        choose(selected);
      }
    });

    options.forEach((option, index) => {
      option.addEventListener('focus', () => choose(index));
      option.addEventListener('pointerenter', () => choose(index));
      option.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          choose(index + (event.key === 'ArrowDown' ? 1 : -1), true);
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          choose(event.key === 'Home' ? 0 : options.length - 1, true);
        }
      });
    });

    terminal.querySelector('[data-terminal-focus]')?.addEventListener('click', () => input.focus());
    choose(0);
  }
})();
