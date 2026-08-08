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

    toast.textContent = message;

    toast.classList.add('show');

    clearTimeout(this.toastTimer);

    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  },

  modal(title, html) {
    this.$id('modal-title').textContent = title;

    this.$id('modal-content').innerHTML = html;

    this.show('modal');
  },

  closeModal() {
    this.hide('modal');
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
      element.innerHTML = `<img
          src="${this.escape(logoUrl)}"
          alt="Logo"
        />`;
    } else {
      element.textContent = fallback || 'MS';
    }
  },
};
