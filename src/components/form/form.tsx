import {
  ChangeEventHandler,
  FC,
  FormEventHandler,
  useRef,
  useState
} from 'react';
import { IFormProps } from './types';

import styles from './form.module.css';
import clsx from 'clsx';
import {
  Button,
  EmailInput,
  Input,
  PasswordInput
} from '@ya.praktikum/react-developer-burger-ui-components';
// Используйте для проверки формата введённого имени
import { namePattern } from '../../utils/constants';

type FormState = {
  name: string;
  email: string;
  password: string;
  repeatPassword: string;
};

type FormErrors = Record<keyof FormState, string>;

export const Form: FC<IFormProps> = ({ setMode, className }) => {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    repeatPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    email: '',
    password: '',
    repeatPassword: ''
  });
  const touched = useRef<Record<keyof FormState, boolean>>({
    name: false,
    email: false,
    password: false,
    repeatPassword: false
  });
  const validateField = (
    name: keyof FormState,
    value: string,
    data: FormState
  ): string => {
    switch (name) {
      case 'name':
        if (!value) return '';
        return namePattern.test(value) ? '' : 'Некорректный формат имени';
      case 'email':
        if (!value) return '';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ''
          : 'Ой, произошла ошибка!';
      case 'password':
        if (!value) return '';
        return value.length >= 6 ? '' : 'Некорректный пароль';
      case 'repeatPassword':
        if (!value) return '';
        if (value.length < 6) return 'Некорректный пароль';
        return value === data.password ? '' : 'Пароли не совпадают';
    }
    return '';
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormState;

    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);

    // Перевалидируем только если поле уже было "потрогано"
    if (touched.current[fieldName]) {
      const newErrors = { ...errors };
      newErrors[fieldName] = validateField(fieldName, value, newData);
      if (fieldName === 'password') {
        newErrors.repeatPassword = validateField(
          'repeatPassword',
          newData.repeatPassword,
          newData
        );
      }
      setErrors(newErrors);
    }
  };
  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    const fieldName = e.target.name as keyof FormState;
    touched.current[fieldName] = true;
    const newErrors = { ...errors };
    newErrors[fieldName] = validateField(
      fieldName,
      formData[fieldName],
      formData
    );
    if (fieldName === 'password') {
      newErrors.repeatPassword = validateField(
        'repeatPassword',
        formData.repeatPassword,
        formData
      );
    }
    setErrors(newErrors);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    // Помечаем все поля как потроганные
    (Object.keys(touched.current) as (keyof FormState)[]).forEach((key) => {
      touched.current[key] = true;
    });

    const newErrors: FormErrors = {
      name: validateField('name', formData.name, formData),
      email: validateField('email', formData.email, formData),
      password: validateField('password', formData.password, formData),
      repeatPassword: validateField(
        'repeatPassword',
        formData.repeatPassword,
        formData
      )
    };
    setErrors(newErrors);

    if (!Object.values(newErrors).some((err) => err)) {
      setMode('complete');
    }
  };
  const isAllFilled =
    formData.name &&
    formData.email &&
    formData.password &&
    formData.repeatPassword;

  return (
    <form
      className={clsx(styles.form, className)}
      data-testid='form'
      onSubmit={handleSubmit}
    >
      <div className={styles.icon} />
      <div className={styles.text_box}>
        <p className='text text_type_main-large'>Мы нуждаемся в вашей силе!</p>
        <p className={clsx(styles.text, 'text text_type_main-medium')}>
          Зарегистрируйтесь на нашей платформе, чтобы присоединиться к списку
          контрибьюторов
        </p>
      </div>
      <fieldset className={styles.fieldset}>
        <Input
          type='text'
          name='name'
          required
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder='Имя'
          data-testid='name-input'
          extraClass={styles.input}
          {...(!!errors.name && { error: true, errorText: errors.name })}
        />
        <EmailInput
          name='email'
          required
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder='E-mail'
          data-testid='email-input'
          extraClass={styles.input}
          {...(!!errors.email && { error: true, errorText: errors.email })}
        />
        <PasswordInput
          name='password'
          required
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder='Пароль'
          data-testid='password-input'
          extraClass={styles.input}
          {...(!!errors.password && {
            error: true,
            errorText: errors.password
          })}
        />
        <PasswordInput
          name='repeatPassword'
          required
          value={formData.repeatPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder='Повторите пароль'
          data-testid='repeat-password-input'
          extraClass={styles.input}
          {...(!!errors.repeatPassword && {
            error: true,
            errorText: errors.repeatPassword
          })}
        />
        <Button
          htmlType='submit'
          type='primary'
          size='medium'
          disabled={!isAllFilled}
        >
          Зарегистрироваться
        </Button>
      </fieldset>
      <div className={styles.signin_box}>
        <p className='text text_type_main-default text_color_inactive'>
          Уже зарегистрированы?
        </p>
        <Button
          htmlType='button'
          type='secondary'
          size='medium'
          extraClass={styles.signin_btn}
        >
          Войти
        </Button>
      </div>
    </form>
  );
};
