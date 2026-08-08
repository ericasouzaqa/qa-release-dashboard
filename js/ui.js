const UI = {
  $id(id) {
    return document.getElementById(id);
  },

  show(element) {
    if (typeof element === 'string') {
      element = this.$id(element);
    }

    element?.classList.remove('hidden');
  },

  hide(element) {
    if (typeof element === 'string') {
      element = this.$id(element);
    }

    element?.classList.add('hidden');
  },

  toast(message) {
    const toast = this.$id('toast');

    if (!toast) return;

    const messageElement = toast.querySelector('#toast-msg') || toast;

    messageElement.textContent = message;

    toast.classList.add('show');

    clearTimeout(this.toastTimer);

    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  },

  modal(title, html) {
    const titleElement = this.$id('modal-title');
    const contentElement = this.$id('modal-content');
    const modal = this.$id('modal-bg');

    if (titleElement) {
      titleElement.textContent = title;
    }

    if (contentElement) {
      contentElement.innerHTML = html;
    }

    modal?.classList.add('open');
  },

  closeModal() {
    this.$id('modal-bg')?.classList.remove('open');
  },

  escape(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  typeClass(type) {
    if (type === 'Implementação') {
      return 'implementation';
    }

    if (type === 'Melhoria') {
      return 'improvement';
    }

    return 'fix';
  },

  renderLogo(element, logoUrl, fallback) {
    if (!element) return;

    if (logoUrl) {
      element.innerHTML = `
        <img
          src="${this.escape(logoUrl)}"
          alt="Logo"
        />
      `;
    } else {
      element.textContent = fallback || 'RD';
    }
  },

  download(filename, content, type = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);
  },

  csvEscape(value) {
    const text = String(value ?? '');

    return `"${text.replace(/"/g, '""')}"`;
  },

  formatMultiline(value) {
    return this.escape(value).replace(/\n/g, '<br>');
  },

  countTypes(items = []) {
    return items.reduce(
      (result, item) => {
        const type = item.tipo || 'Implementação';

        if (type === 'Implementação') {
          result.implementation++;
        } else if (type === 'Melhoria') {
          result.improvement++;
        } else if (type === 'Correção') {
          result.fix++;
        }

        return result;
      },
      {
        implementation: 0,
        improvement: 0,
        fix: 0,
      }
    );
  },
};
