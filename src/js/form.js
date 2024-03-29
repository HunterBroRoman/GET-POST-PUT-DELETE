import { Notify } from 'notiflix/build/notiflix-notify-aio';
import throttle from 'lodash.throttle';
import localStorApi from './localestorage';
import { spinerPlay, spinerStop } from './spinner';
import { refs } from './refs';
import { postContact } from './service/contact.service';
import { createContact } from './createContact';

const LOCAL_STORAGE_KEY = 'user-data';

initForm();

const toggleHiddenModal = () => {
  refs.backdrop.classList.toggle('is-hidden');
};

const handleSubmit = event => {
  event.preventDefault();
  const { name, email, phone } = event.target.elements;

  if (name.value === '' || email.value === '' || phone.value === '') {
    Notify.failure('Заповніть всі поля і спробуйте ще раз!');
    return;
  }

  const userData = {};

  const formData = new FormData(refs.form);

  formData.forEach((value, name) => {
    userData[name] = value;
  });
  spinerPlay();
  postContact(userData)
    .then(contact => {
      Notify.success(`${contact.name} created!`, { position: 'left-top' });
      const markup = createContact(contact);
      refs.list.insertAdjacentHTML('afterbegin', markup);
    })
    .catch(error => {
      console.log(error);
    })
    .finally(() => {
      spinerStop();
    });

  toggleHiddenModal();
  event.currentTarget.reset();
  localStorApi.remove(LOCAL_STORAGE_KEY);
};

const handleInput = event => {
  const { name, value } = event.target;
  let persistedData = localStorApi.load(LOCAL_STORAGE_KEY);
  persistedData = persistedData ? persistedData : {};

  persistedData[name] = value;
  localStorApi.save(LOCAL_STORAGE_KEY, persistedData);
};

function initForm() {
  let persistedData = localStorApi.load(LOCAL_STORAGE_KEY);
  if (persistedData) {
    Object.entries(persistedData).forEach(([name, value]) => {
      console.log(refs.form.elements[name]);
      refs.form.elements[name].value = value;
    });
  }
}

refs.openModal.addEventListener('click', toggleHiddenModal);
refs.closeModal.addEventListener('click', toggleHiddenModal);

refs.form.addEventListener('input', throttle(handleInput, 300));
refs.form.addEventListener('submit', handleSubmit);
