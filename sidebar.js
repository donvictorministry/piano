/**
 * DV-PIANO: Sidebar & Public Informational Modals (sidebar.js)
 * Manages Drawer Menu, About App, About Developer, About Team, How to Use, Terms, and Contact
 */

(function () {
  'use strict';

  function initSidebarAndModals() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarOpenBtn = document.getElementById('sidebarOpenBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

    function openSidebar() {
      if (sidebar && sidebarOverlay) {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('open');
      }
    }

    function closeSidebar() {
      if (sidebar && sidebarOverlay) {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('open');
      }
    }

    if (sidebarOpenBtn) sidebarOpenBtn.addEventListener('click', openSidebar);
    if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    // Open Modals from Sidebar Nav Items
    document.querySelectorAll('.sidebar-item').forEach((item) => {
      item.addEventListener('click', () => {
        const modalId = item.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
          closeSidebar();
          modal.classList.add('active');
        }
      });
    });

    // Close Modals via Back Button
    document.querySelectorAll('.modal-back-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const parentModal = btn.closest('.full-modal');
        if (parentModal) {
          parentModal.classList.remove('active');
        }
      });
    });

    // Developer Bio Show More/Less Toggle
    const devBioText = document.getElementById('devBioText');
    const devBioToggleBtn = document.getElementById('bioToggleBtn');
    let isDevBioExpanded = false;

    if (devBioToggleBtn && devBioText) {
      devBioToggleBtn.addEventListener('click', () => {
        isDevBioExpanded = !isDevBioExpanded;
        devBioText.classList.toggle('expanded', isDevBioExpanded);
        devBioToggleBtn.textContent = isDevBioExpanded ? 'Show less' : 'Show more';
      });
    }

    // Team Bio Show More/Less Toggle
    const teamBioText = document.getElementById('teamBioText');
    const teamBioToggleBtn = document.getElementById('teamBioToggleBtn');
    let isTeamBioExpanded = false;

    if (teamBioToggleBtn && teamBioText) {
      teamBioToggleBtn.addEventListener('click', () => {
        isTeamBioExpanded = !isTeamBioExpanded;
        teamBioText.classList.toggle('expanded', isTeamBioExpanded);
        teamBioToggleBtn.textContent = isTeamBioExpanded ? 'Show less' : 'Show more';
      });
    }
  }

  // Export
  window.DVPianoSidebar = {
    init: initSidebarAndModals
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebarAndModals);
  } else {
    initSidebarAndModals();
  }
})();