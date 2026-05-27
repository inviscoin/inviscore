import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, WalletState, Transaction, DashboardBlock, 
  Book, Movie, InventoryItem, UserTier, AgeGroup, BlockType 
} from '../types';
import { supabase, SupabaseService, isSupabaseConfigured } from '../lib/supabase';

// Multi-language dictionary for exact 12-language support
export const DICTIONARY = {
  'pt-BR': {
    welcome: 'INVIS ECOSYSTEM',
    status_msg: 'SISTEMA SINCRONIZADO',
    hint: 'Gire o carrossel no Foot para começar',
    loading: 'Sincronizando com a Matriz...',
    lock: 'CADEADO MATEMÁTICO',
    digital_id: 'IDENTIDADE RECONHECIDA',
    toque_para_acessar: 'Toque para Acessar',
    login_title: 'LOGIN',
    login_btn: 'ENTRAR',
    processando: 'PROCESSANDO...',
    user_placeholder: 'Usuário, E-mail ou Telefone',
    password_placeholder: 'Senha',
    or_connect: 'Ou conecte com:',
    no_account: 'Não possui cadastro? Clique Aqui',
    forgot_password: 'Esqueci a senha',
    reg_title: 'NOVA CONTA INVIS',
    full_name_label: 'Nome Completo',
    nickname_label: 'Nickname (5-10 chars)',
    email_label: 'E-mail',
    phone_label: 'Telefone (9 dígitos)',
    password_reg_label: 'Senha (Mín. 6 chars + Símbolo)',
    create_btn: 'CRIAR CONTA',
    age_label: 'QUAL SUA DATA DE NASCIMENTO?',
    coppa_note: 'Esta informação é imutável e define seu ambiente.',
    accept_btn: 'ACEITO E ASSINO',
    read_scroll: 'ROLE ATÉ O FIM',
    active_tasks_msg: 'Nenhuma atividade ativa.',
    wallet_title: 'CARTEIRA DIGITAL',
    fiat_conv_title: 'Conversor de Ativos',
    fiat_min_withdraw: 'Mínimo para saque: R$ 20,00',
    btn_withdraw: 'SOLICITAR SAQUE',
    btn_back: 'VOLTAR',
    donate_msg: 'Sua contribuição ajuda a manter os servidores ativos.',
    btn_copy: 'COPIAR',
    copied: 'Copiado para a área de transferência!',
    logout: 'LOGOUT',
    cancel: 'CANCELAR',
    rec_title: 'RECUPERAÇÃO',
    enter_email: 'Digite seu e-mail cadastrado',
    enter_name: 'Para confirmar, digite seu primeiro nome',
    rec_success: 'Sua senha chegará em seu e-mail em até 12 horas.',
    blocks_limit: 'Limite de 3 blocos atingido. Minimize uma atividade.',
    fingerprint_text: 'Impressão digital sutil'
  ,
    login_err_empty: 'O e-mail e a senha são obrigatórios.',
    login_auth: 'Autenticando na Matriz...',
    login_err_invalid: 'E-mail ou senha incorretos.',
    reg_err_name: 'O Nome Completo deve possuir no mínimo 15 caracteres.',
    reg_err_email: 'E-mail formatado incorretamente.',
    reg_err_nick: 'O Nickname deve conter de 5 a 10 caracteres.',
    reg_err_birth: 'Forneça uma Data de Nascimento válida.',
    reg_err_pass: 'Sua senha não atende aos critérios.',
    reg_req_min: 'Min. 6 caracteres',
    reg_req_upper: 'Letra Maiúscula',
    reg_req_lower: 'Letra Minúscula',
    reg_req_num: 'Um dígito',
    reg_req_spec: 'Especial (@$!%*?&)',
    back_login: 'Voltar ao Login',
    reg_subtitle: 'Cadastro Blindado Padrão INVIS',
    panel_title: 'PAINEL INVIS CORE',
    withdraw_bal: 'Balanço Sacável:',
    tech_level: 'Nível Tecnológico:',
    aura_title: 'Aura Cromática do Dispositivo',
    upgrade_title: 'Contratos de Produtividade',
    metrics_title: 'MÉTRICAS DE CONEXÃO DA MATRIZ',
    end_session: 'ENCERRAR SESSÃO'
  },
  'en-US': {
    welcome: 'INVIS ECOSYSTEM',
    status_msg: 'SYSTEM SYNCHRONIZED',
    hint: 'Rotate the carousel on the Foot to start',
    loading: 'Synchronizing with Matrix...',
    lock: 'MATHEMATICAL LOCK',
    digital_id: 'IDENTITY RECOGNIZED',
    toque_para_acessar: 'Tap to Access',
    login_title: 'LOGIN',
    login_btn: 'LOG IN',
    processando: 'PROCESSING...',
    user_placeholder: 'Username, E-mail or Phone',
    password_placeholder: 'Password',
    or_connect: 'Or connect with:',
    no_account: 'No account? Sign Up Here',
    forgot_password: 'Forgot password',
    reg_title: 'NEW INVIS ACCOUNT',
    full_name_label: 'Full Name',
    nickname_label: 'Nickname (5-10 chars)',
    email_label: 'E-mail',
    phone_label: 'Phone (9 digits)',
    password_reg_label: 'Password (Min 6 chars + Symbol)',
    create_btn: 'CREATE ACCOUNT',
    age_label: 'WHAT IS YOUR DATE OF BIRTH?',
    coppa_note: 'This information is immutable and defines your environment.',
    accept_btn: 'I ACCEPT & SIGN',
    read_scroll: 'SCROLL TO THE END',
    active_tasks_msg: 'No active activity.',
    wallet_title: 'DIGITAL WALLET',
    fiat_conv_title: 'Asset Converter',
    fiat_min_withdraw: 'Min withdrawal: R$ 20,00',
    btn_withdraw: 'REQUEST WITHDRAWAL',
    btn_back: 'BACK',
    donate_msg: 'Your contribution helps keep the servers active.',
    btn_copy: 'COPY',
    copied: 'Copied to clipboard!',
    logout: 'LOGOUT',
    cancel: 'CANCEL',
    rec_title: 'RECOVERY',
    enter_email: 'Enter your registered e-mail',
    enter_name: 'To confirm, enter your first name',
    rec_success: 'Your password will reach your e-mail within 12 hours.',
    blocks_limit: 'Limit of 3 blocks reached. Minimize an activity.',
    fingerprint_text: 'Slight fingerprint'
  ,
    login_err_empty: 'E-mail and password are required.',
    login_auth: 'Authenticating in Matrix...',
    login_err_invalid: 'Invalid E-mail or password.',
    reg_err_name: 'Full Name must have at least 15 characters.',
    reg_err_email: 'Invalid e-mail format.',
    reg_err_nick: 'Nickname must have 5-10 characters.',
    reg_err_birth: 'Provide a valid Date of Birth.',
    reg_err_pass: 'Your password does not meet the criteria.',
    reg_req_min: 'Min 6 characters',
    reg_req_upper: 'Uppercase Letter',
    reg_req_lower: 'Lowercase Letter',
    reg_req_num: 'One digit',
    reg_req_spec: 'Special (@$!%*?&)',
    back_login: 'Back to Login',
    reg_subtitle: 'INVIS Standard Blind Registration',
    panel_title: 'INVIS CORE PANEL',
    withdraw_bal: 'Withdrawable Balance:',
    tech_level: 'Tech Level:',
    aura_title: 'Device Chromatic Aura',
    upgrade_title: 'Productivity Contracts',
    metrics_title: 'MATRIX CONNECTION METRICS',
    end_session: 'END SESSION'
  },
  'es-ES': {
    welcome: 'ECOSISTEMA INVIS',
    status_msg: 'SISTEMA SINCRONIZADO',
    hint: 'Gira el carrusel en el Pie para empezar',
    loading: 'Sincronizando con la Matriz...',
    lock: 'CANDADO MATEMÁTICO',
    digital_id: 'IDENTIDAD RECONOCIDA',
    toque_para_acessar: 'Toca para Acceder',
    login_title: 'INICIAR SESIÓN',
    login_btn: 'ENTRAR',
    processando: 'PROCESANDO...',
    user_placeholder: 'Usuario, Correo o Teléfono',
    password_placeholder: 'Contraseña',
    or_connect: 'O conéctate con:',
    no_account: '¿No tienes cuenta? Regístrate Aquí',
    forgot_password: 'Olvidé mi contraseña',
    reg_title: 'NUEVA CUENTA INVIS',
    full_name_label: 'Nombre Completo',
    nickname_label: 'Apodo (5-10 chars)',
    email_label: 'Correo electrónico',
    phone_label: 'Teléfono (9 dígitos)',
    password_reg_label: 'Contraseña (Mín. 6 chars + Símbolo)',
    create_btn: 'CREAR CUENTA',
    age_label: '¿CUÁL ES SU FECHA DE NACIMIENTO?',
    coppa_note: 'Esta información es inmutable y define su entorno.',
    accept_btn: 'ACEPTO Y FIRMO',
    read_scroll: 'DESLIZA HASTA EL FINAL',
    active_tasks_msg: 'Ninguna actividad activa.',
    wallet_title: 'CARTERA DIGITAL',
    fiat_conv_title: 'Conversor de Activos',
    fiat_min_withdraw: 'Retiro mínimo: R$ 20,00',
    btn_withdraw: 'SOLICITAR RETIRO',
    btn_back: 'VOLVER',
    donate_msg: 'Su contribución ayuda a mantener los servidores activos.',
    btn_copy: 'COPIAR',
    copied: '¡Copiado al portapapeles!',
    logout: 'SALIR',
    cancel: 'CANCELAR',
    rec_title: 'RECUPERACIÓN',
    enter_email: 'Ingrese su correo registrado',
    enter_name: 'Para confirmar, ingrese su primer nombre',
    rec_success: 'Su contraseña llegará a su correo en un plazo de 12 horas.',
    blocks_limit: 'Límite de 3 bloques alcanzado. Minimiza una actividad.',
    fingerprint_text: 'Huella digital sutil'
  ,
    login_err_empty: 'El correo y la contraseña son obligatorios.',
    login_auth: 'Autenticando en la Matriz...',
    login_err_invalid: 'Correo o contraseña incorrectos.',
    reg_err_name: 'El nombre completo debe tener al menos 15 caracteres.',
    reg_err_email: 'Formato de correo inválido.',
    reg_err_nick: 'El apodo debe tener entre 5 y 10 caracteres.',
    reg_err_birth: 'Proporcione una fecha de nacimiento válida.',
    reg_err_pass: 'Su contraseña no cumple con los criterios.',
    reg_req_min: 'Mín. 6 caracteres',
    reg_req_upper: 'Letra mayúscula',
    reg_req_lower: 'Letra minúscula',
    reg_req_num: 'Un dígito',
    reg_req_spec: 'Especial (@$!%*?&)',
    back_login: 'Volver a Iniciar Sesión',
    reg_subtitle: 'Registro Blindado Estándar INVIS',
    panel_title: 'PANEL INVIS CORE',
    withdraw_bal: 'Saldo Retirable:',
    tech_level: 'Nivel Tecnológico:',
    aura_title: 'Aura Cromática del Dispositivo',
    upgrade_title: 'Contratos de Productividad',
    metrics_title: 'MÉTRICAS DE CONEXIÓN DE LA MATRIZ',
    end_session: 'CERRAR SESIÓN'
  },
  'fr-FR': {
    welcome: 'ÉCOSYSTÈME INVIS',
    status_msg: 'SYSTÈME SYNCHRONISÉ',
    hint: 'Faites tourner le carrousel sur le Pied pour commencer',
    loading: 'Synchronisation avec la Matrice...',
    lock: 'CADENAS MATHÉMATIQUE',
    digital_id: 'IDENTITÉ RECONNUE',
    toque_para_acessar: 'Appuyez pour Accéder',
    login_title: 'CONNEXION',
    login_btn: 'SE CONNECTER',
    processando: 'TRAITEMENT...',
    user_placeholder: 'Identifiant, E-mail ou Téléphone',
    password_placeholder: 'Mot de passe',
    or_connect: 'Ou connectez-vous avec :',
    no_account: 'Pas de compte ? Inscrivez-vous Ici',
    forgot_password: 'Mot de passe oublié',
    reg_title: 'NOUVEAU COMPTE INVIS',
    full_name_label: 'Nom Complet',
    nickname_label: 'Pseudo (5-10 chars)',
    email_label: 'E-mail',
    phone_label: 'Téléphone (9 chiffres)',
    password_reg_label: 'Mot de passe (Min 6 chars + Symbole)',
    create_btn: 'CRÉER UN COMPTE',
    age_label: 'QUELLE EST VOTRE DATE DE NAISSANCE ?',
    coppa_note: 'Cette information est immuable et définit votre environnement.',
    accept_btn: 'J’ACCEPTE & SIGNE',
    read_scroll: 'DÉFILEZ JUSQU’AU BOUT',
    active_tasks_msg: 'Aucune activité active.',
    wallet_title: 'PORTEFEUILLE NUMÉRIQUE',
    fiat_conv_title: 'Convertisseur d’Actifs',
    fiat_min_withdraw: 'Retrait minimum : R$ 20,00',
    btn_withdraw: 'DEMANDER UN RETRAIT',
    btn_back: 'RETOUR',
    donate_msg: 'Votre contribution aide à maintenir les serveurs actifs.',
    btn_copy: 'COPIER',
    copied: 'Copié dans le presse-papiers !',
    logout: 'DÉCONNEXION',
    cancel: 'ANNULER',
    rec_title: 'RÉCUPÉRATION',
    enter_email: 'Entrez votre e-mail enregistré',
    enter_name: 'Pour confirmer, entrez votre prénom',
    rec_success: 'Votre mot de passe arrivera sur votre e-mail dans 12 heures.',
    blocks_limit: 'Limite de 3 blocs atteinte. Minimisez une activité.',
    fingerprint_text: 'Empreinte digitale subtile'
  ,
    login_err_empty: 'E-mail and password are required.',
    login_auth: 'Authenticating in Matrix...',
    login_err_invalid: 'Invalid E-mail or password.',
    reg_err_name: 'Full Name must have at least 15 characters.',
    reg_err_email: 'Invalid e-mail format.',
    reg_err_nick: 'Nickname must have 5-10 characters.',
    reg_err_birth: 'Provide a valid Date of Birth.',
    reg_err_pass: 'Your password does not meet the criteria.',
    reg_req_min: 'Min 6 characters',
    reg_req_upper: 'Uppercase Letter',
    reg_req_lower: 'Lowercase Letter',
    reg_req_num: 'One digit',
    reg_req_spec: 'Special (@$!%*?&)',
    back_login: 'Back to Login',
    reg_subtitle: 'INVIS Standard Blind Registration',
    panel_title: 'INVIS CORE PANEL',
    withdraw_bal: 'Withdrawable Balance:',
    tech_level: 'Tech Level:',
    aura_title: 'Device Chromatic Aura',
    upgrade_title: 'Productivity Contracts',
    metrics_title: 'MATRIX CONNECTION METRICS',
    end_session: 'END SESSION'
  },
  'de-DE': {
    welcome: 'INVIS ÖKOSYSTEM',
    status_msg: 'SYSTEM SYNCHRONISIERT',
    hint: 'Drehen Sie das Karussell am Fuß, um zu beginnen',
    loading: 'Synchronisierung mit der Matrix...',
    lock: 'MATHEMATISCHES SCHLOSS',
    digital_id: 'IDENTITÄT ERKANNT',
    toque_para_acessar: 'Tippen Sie zum Aufrufen',
    login_title: 'LOGIN',
    login_btn: 'EINLOGGEN',
    processando: 'BEARBEITUNG...',
    user_placeholder: 'Benutzername, E-Mail oder Telefon',
    password_placeholder: 'Kennwort',
    or_connect: 'Oder verbinden mit:',
    no_account: 'Noch kein Konto? Hier registrieren',
    forgot_password: 'Passwort vergessen',
    reg_title: 'NEUES INVIS-KONTO',
    full_name_label: 'Vollständiger Name',
    nickname_label: 'Spitzname (5-10 Zeichen)',
    email_label: 'E-Mail',
    phone_label: 'Telefonnummer (9 Stellen)',
    password_reg_label: 'Kennwort (Mind. 6 Zeichen + Symbol)',
    create_btn: 'KONTO ERSTELLEN',
    age_label: 'WANN IST IHR GEBURTSDATUM?',
    coppa_note: 'Diese Information ist unveränderlich und definiert Ihre Umgebung.',
    accept_btn: 'AKZEPTIEREN & UNTERSCHREIBEN',
    read_scroll: 'SCROLLEN SIE BIS ZUM ENDE',
    active_tasks_msg: 'Keine aktive Aktivität.',
    wallet_title: 'DIGITALE GELDBÖRSE',
    fiat_conv_title: 'Asset-Konverter',
    fiat_min_withdraw: 'Mindestauszahlung: R$ 20,00',
    btn_withdraw: 'AUSZAHLUNG BEANTRAGEN',
    btn_back: 'ZURÜCK',
    donate_msg: 'Ihr Beitrag hilft, die Server aktiv zu halten.',
    btn_copy: 'KOPIEREN',
    copied: 'In die Zwischenablage kopiert!',
    logout: 'LOGOUT',
    cancel: 'ABBRECHEN',
    rec_title: 'PASSWORT-RÜCKSETZUNG',
    enter_email: 'Geben Sie Ihre registrierte E-Mail ein',
    enter_name: 'Geben Sie zur Bestätigung Ihren Vornamen ein',
    rec_success: 'Ihr Passwort wird innerhalb von 12 Stunden an Ihre E-Mail gesendet.',
    blocks_limit: 'Limit von 3 Blöcken erreicht. Minimieren Sie eine Aktivität.',
    fingerprint_text: 'Dezenter Fingerabdruck'
  ,
    login_err_empty: 'E-mail and password are required.',
    login_auth: 'Authenticating in Matrix...',
    login_err_invalid: 'Invalid E-mail or password.',
    reg_err_name: 'Full Name must have at least 15 characters.',
    reg_err_email: 'Invalid e-mail format.',
    reg_err_nick: 'Nickname must have 5-10 characters.',
    reg_err_birth: 'Provide a valid Date of Birth.',
    reg_err_pass: 'Your password does not meet the criteria.',
    reg_req_min: 'Min 6 characters',
    reg_req_upper: 'Uppercase Letter',
    reg_req_lower: 'Lowercase Letter',
    reg_req_num: 'One digit',
    reg_req_spec: 'Special (@$!%*?&)',
    back_login: 'Back to Login',
    reg_subtitle: 'INVIS Standard Blind Registration',
    panel_title: 'INVIS CORE PANEL',
    withdraw_bal: 'Withdrawable Balance:',
    tech_level: 'Tech Level:',
    aura_title: 'Device Chromatic Aura',
    upgrade_title: 'Productivity Contracts',
    metrics_title: 'MATRIX CONNECTION METRICS',
    end_session: 'END SESSION'
  },
  'it-IT': {
    welcome: 'ECOSISTEMA INVIS',
    status_msg: 'SISTEMA SINCRONIZZATO',
    hint: 'Ruota il carosello sul Piede per iniziare',
    loading: 'Sincronizzazione della matrice...',
    lock: 'LUCCHETTO MATEMATICO',
    digital_id: 'IDENTITÀ RICONOSCIUTA',
    toque_para_acessar: 'Tocca per Accedere',
    login_title: 'ACCESSO',
    login_btn: 'ACCEDI',
    processando: 'ELABORAZIONE...',
    user_placeholder: 'Nome utente, E-mail o Telefono',
    password_placeholder: 'Password',
    or_connect: 'O connettiti con:',
    no_account: 'Non hai un account? Registrati Qui',
    forgot_password: 'Password dimenticata',
    reg_title: 'NUOVO ACCOUNT INVIS',
    full_name_label: 'Nome Completo',
    nickname_label: 'Nickname (5-10 caratteri)',
    email_label: 'E-mail',
    phone_label: 'Telefono (9 cifre)',
    password_reg_label: 'Password (Min 6 caratteri + Simbolo)',
    create_btn: 'CREA ACCOUNT',
    age_label: 'QUAL È LA TUA DATA DI NASCITA?',
    coppa_note: 'Questa informazione è immutabile e definisce la tua dashboard.',
    accept_btn: 'ACCETTO E FIRMO',
    read_scroll: 'SCORRI FINO ALLA FINE',
    active_tasks_msg: 'Nessuna attività attiva.',
    wallet_title: 'PORTAFOGLIO DIGITALE',
    fiat_conv_title: 'Convertitore di Asset',
    fiat_min_withdraw: 'Prelievo minimo: R$ 20,00',
    btn_withdraw: 'RICHIEDI PRELIEVO',
    btn_back: 'INDIETRO',
    donate_msg: 'Il tuo contributo aiuta a mantenere attivi i server.',
    btn_copy: 'COPIA',
    copied: 'Copiato negli appunti!',
    logout: 'LOGOUT',
    cancel: 'ANNULLA',
    rec_title: 'RECUPERO',
    enter_email: 'Inserisci la tua e-mail registrata',
    enter_name: 'Per confermare, inserisci il tuo nome di battesimo',
    rec_success: 'La tua password arriverà sulla tua e-mail entro 12 ore.',
    blocks_limit: 'Limite di 3 blocchi raggiunto. Riduci a icona un’attività.',
    fingerprint_text: 'Impronta digitale impercettibile'
  ,
    login_err_empty: 'E-mail and password are required.',
    login_auth: 'Authenticating in Matrix...',
    login_err_invalid: 'Invalid E-mail or password.',
    reg_err_name: 'Full Name must have at least 15 characters.',
    reg_err_email: 'Invalid e-mail format.',
    reg_err_nick: 'Nickname must have 5-10 characters.',
    reg_err_birth: 'Provide a valid Date of Birth.',
    reg_err_pass: 'Your password does not meet the criteria.',
    reg_req_min: 'Min 6 characters',
    reg_req_upper: 'Uppercase Letter',
    reg_req_lower: 'Lowercase Letter',
    reg_req_num: 'One digit',
    reg_req_spec: 'Special (@$!%*?&)',
    back_login: 'Back to Login',
    reg_subtitle: 'INVIS Standard Blind Registration',
    panel_title: 'INVIS CORE PANEL',
    withdraw_bal: 'Withdrawable Balance:',
    tech_level: 'Tech Level:',
    aura_title: 'Device Chromatic Aura',
    upgrade_title: 'Productivity Contracts',
    metrics_title: 'MATRIX CONNECTION METRICS',
    end_session: 'END SESSION'
  },
  'ja-JP': {
    welcome: 'INVIS エコシステム',
    status_msg: 'マトリックス同期中',
    hint: 'コマンドの開始はフットのカルーセルを回す',
    loading: 'マトリックスを接続中...',
    lock: 'マセマティカル ロック',
    digital_id: 'スマートキー認証完了',
    toque_para_acessar: 'クリックしてアクセス',
    login_title: 'ログイン',
    login_btn: '接続',
    processando: '認証処理中...',
    user_placeholder: 'ユーザー名、メール、又は電話番号',
    password_placeholder: 'パスワード',
    or_connect: '他サービスで接続:',
    no_account: 'アカウントをお持ちではありませんか？登録はこちら',
    forgot_password: 'パスワードをお忘れですか？',
    reg_title: '新規 INVIS アカウント作成',
    full_name_label: '氏名（フルネーム）',
    nickname_label: 'ニックネーム（5-10文字）',
    email_label: 'メールアドレス',
    phone_label: '電話番号（9桁）',
    password_reg_label: '暗証番号（6文字以上＋英数記号）',
    create_btn: '暗号マトリックスに署名',
    age_label: '生年月日を登録してください',
    coppa_note: '一度入力された生年月日は書き換えることができません。',
    accept_btn: '契約の承認',
    read_scroll: 'スクロールして確認を最後まで完了する',
    active_tasks_msg: '現在、アクティブなハブはありません。',
    wallet_title: 'デジタル暗号財布',
    fiat_conv_title: 'アセットコンバーター',
    fiat_min_withdraw: '出金最小額: R$ 20,00',
    btn_withdraw: '出金を申請する',
    btn_back: '戻る',
    donate_msg: 'コントリビュートはサーバー維持に直接適用されます。',
    btn_copy: 'コピー',
    copied: 'クリップボードにコピーしました！',
    logout: 'セッション切断',
    cancel: '中断',
    rec_title: 'アカウント復旧',
    enter_email: '登録済みのメールアドレスを入力',
    enter_name: '親元の確認のため、名（ファーストネーム）を入力',
    rec_success: '12時間以内に暗号化されたログインキーがメールで送信されます。',
    blocks_limit: '3タスクの割り当て限界。現在のアドオンを最小化してください。',
    fingerprint_text: '微小指紋センサー'
  ,
    login_err_empty: 'E-mail and password are required.',
    login_auth: 'Authenticating in Matrix...',
    login_err_invalid: 'Invalid E-mail or password.',
    reg_err_name: 'Full Name must have at least 15 characters.',
    reg_err_email: 'Invalid e-mail format.',
    reg_err_nick: 'Nickname must have 5-10 characters.',
    reg_err_birth: 'Provide a valid Date of Birth.',
    reg_err_pass: 'Your password does not meet the criteria.',
    reg_req_min: 'Min 6 characters',
    reg_req_upper: 'Uppercase Letter',
    reg_req_lower: 'Lowercase Letter',
    reg_req_num: 'One digit',
    reg_req_spec: 'Special (@$!%*?&)',
    back_login: 'Back to Login',
    reg_subtitle: 'INVIS Standard Blind Registration',
    panel_title: 'INVIS CORE PANEL',
    withdraw_bal: 'Withdrawable Balance:',
    tech_level: 'Tech Level:',
    aura_title: 'Device Chromatic Aura',
    upgrade_title: 'Productivity Contracts',
    metrics_title: 'MATRIX CONNECTION METRICS',
    end_session: 'END SESSION'
  },
  'zh-CN': {
    welcome: 'INVIS 智能生态系统',
    status_msg: '矩阵网络已同步',
    hint: '转动底部的虚拟滚轮以开启引擎',
    loading: '中央安全验证模块检查中...',
    lock: '高精数控电磁锁',
    digital_id: '生物真皮特征已被确认',
    toque_para_acessar: '触摸传感器载入网页',
    login_title: '登录',
    login_btn: '连接网络',
    processando: '矩阵链路编译中...',
    user_placeholder: '用户名、邮箱或联络电话',
    password_placeholder: '安全密钥',
    or_connect: '或者使用授权媒介登录:',
    no_account: '还没有主链地址？立刻初始化',
    forgot_password: '丢失密钥',
    reg_title: '创建新 INVIS 数字档案',
    full_name_label: '全名',
    nickname_label: '代号（5至10字节）',
    email_label: '电子邮箱',
    phone_label: '联络电话（9位数字）',
    password_reg_label: '安全组合密码（6位以上＋特殊字符）',
    create_btn: '创建数字档案',
    age_label: '请提供您的出生年月日',
    coppa_note: '此信息属于最高安全级别，写入后将不可撤销。',
    accept_btn: '接受并签署协议',
    read_scroll: '阅读全文至页尾以解除锁死',
    active_tasks_msg: '中枢目前无活动。',
    wallet_title: '数字签名卡包',
    fiat_conv_title: '法币等值转换器',
    fiat_min_withdraw: '最小提现数额: R$ 20,00',
    btn_withdraw: '发起提现结算',
    btn_back: '回退',
    donate_msg: '您的贡献将用于支持无节点服务器的带宽租赁。',
    btn_copy: '复制密匙',
    copied: '密匙已存储到粘帖板！',
    logout: '断开连接',
    cancel: '取消操作',
    rec_title: '密钥找回',
    enter_email: '输入登记注册的电子邮箱',
    enter_name: '提供首位主名（中文名或急救口令）',
    rec_success: '重置密钥将在12小时内发放至您的备份邮箱中。',
    blocks_limit: '超出三轨限额。请释放不常使用的视窗。',
    fingerprint_text: '极细指纹扫描仪'
  ,
    login_err_empty: 'E-mail and password are required.',
    login_auth: 'Authenticating in Matrix...',
    login_err_invalid: 'Invalid E-mail or password.',
    reg_err_name: 'Full Name must have at least 15 characters.',
    reg_err_email: 'Invalid e-mail format.',
    reg_err_nick: 'Nickname must have 5-10 characters.',
    reg_err_birth: 'Provide a valid Date of Birth.',
    reg_err_pass: 'Your password does not meet the criteria.',
    reg_req_min: 'Min 6 characters',
    reg_req_upper: 'Uppercase Letter',
    reg_req_lower: 'Lowercase Letter',
    reg_req_num: 'One digit',
    reg_req_spec: 'Special (@$!%*?&)',
    back_login: 'Back to Login',
    reg_subtitle: 'INVIS Standard Blind Registration',
    panel_title: 'INVIS CORE PANEL',
    withdraw_bal: 'Withdrawable Balance:',
    tech_level: 'Tech Level:',
    aura_title: 'Device Chromatic Aura',
    upgrade_title: 'Productivity Contracts',
    metrics_title: 'MATRIX CONNECTION METRICS',
    end_session: 'END SESSION'
  },
  'ru-RU': {
    welcome: 'INVIS ЭКОСИСТЕМА',
    status_msg: 'СИСТЕМА СИНХРОНИЗИРОВАНА',
    hint: 'Покрутите карусель внизу, чтобы начать',
    loading: 'Синхронизация с Матрицей...',
    lock: 'МАТЕМАТИЧЕСКИЙ ЗАМОК',
    digital_id: 'ЛИЧНОСТЬ РАСПОЗНАНА',
    toque_para_acessar: 'Нажмите для входа',
    login_title: 'ВХОД',
    login_btn: 'ВОЙТИ',
    processando: 'ОБРАБОТКА...',
    user_placeholder: 'Имя пользователя, e-mail или телефон',
    password_placeholder: 'Пароль',
    or_connect: 'Или подключитесь через:',
    no_account: 'Нет учетной записи? Зарегистрируйтесь',
    forgot_password: 'Забыли пароль',
    reg_title: 'НОВАЯ УЧЕТНАЯ ЗАПИСЬ INVIS',
    full_name_label: 'Полное имя',
    nickname_label: 'Никнейм (5-10 символов)',
    email_label: 'E-mail',
    phone_label: 'Телефон (9 цифр)',
    password_reg_label: 'Пароль (мин. 6 симв. + знак)',
    create_btn: 'СОЗДАТЬ АККАУНТ',
    age_label: 'УКАЖИТЕ ДАТУ ВАШЕГО РОЖДЕНИЯ',
    coppa_note: 'Информация неизменяема и определяет доступ.',
    accept_btn: 'ПРИНЯТЬ И ПОДПИСАТЬ',
    read_scroll: 'ПРОКРУТИТЕ ДО КОНЦА',
    active_tasks_msg: 'Нет активных задач.',
    wallet_title: 'ЦИФРОВОЙ КОШЕЛЕК',
    fiat_conv_title: 'Конвертер активов',
    fiat_min_withdraw: 'Минимум на вывод: R$ 20,00',
    btn_withdraw: 'ЗАПРОСИТЬ ВЫВОД',
    btn_back: 'НАЗАД',
    donate_msg: 'Ваше пожертвование помогает держать серверы в сети.',
    btn_copy: 'КОПИРОВАТЬ',
    copied: 'Скопировано в буфер обмена !',
    logout: 'ВЫЙТИ',
    cancel: 'ОТМЕНА',
    rec_title: 'ВОССТАНОВЛЕНИЕ',
    enter_email: 'Введите зарегистрированный e-mail',
    enter_name: 'Для проверки введите ваше имя (первое)',
    rec_success: 'Ваш пароль придет на e-mail в течение 12 часов.',
    blocks_limit: 'Достигнут предел в 3 блока. Сверните одну из вкладок.',
    fingerprint_text: 'Мягкий отпечаток пальца'
  ,
    login_err_empty: 'E-mail and password are required.',
    login_auth: 'Authenticating in Matrix...',
    login_err_invalid: 'Invalid E-mail or password.',
    reg_err_name: 'Full Name must have at least 15 characters.',
    reg_err_email: 'Invalid e-mail format.',
    reg_err_nick: 'Nickname must have 5-10 characters.',
    reg_err_birth: 'Provide a valid Date of Birth.',
    reg_err_pass: 'Your password does not meet the criteria.',
    reg_req_min: 'Min 6 characters',
    reg_req_upper: 'Uppercase Letter',
    reg_req_lower: 'Lowercase Letter',
    reg_req_num: 'One digit',
    reg_req_spec: 'Special (@$!%*?&)',
    back_login: 'Back to Login',
    reg_subtitle: 'INVIS Standard Blind Registration',
    panel_title: 'INVIS CORE PANEL',
    withdraw_bal: 'Withdrawable Balance:',
    tech_level: 'Tech Level:',
    aura_title: 'Device Chromatic Aura',
    upgrade_title: 'Productivity Contracts',
    metrics_title: 'MATRIX CONNECTION METRICS',
    end_session: 'END SESSION'
  },
  'ar-SA': {
    welcome: 'نظام إنفيس',
    status_msg: 'مزامنة دقيقة مع المصفوفة',
    hint: 'قم بتدوير العجلة أسفل القدمين لبدء العمل',
    loading: 'تحميل ملفات الحماية للمصفوفة...',
    lock: 'قفل كود الأمان الرياضي',
    digital_id: 'تم التعرف على البصمة بنجاح',
    toque_para_acessar: 'اضغط للدخول إلى النظام',
    login_title: 'تسجيل الدخول',
    login_btn: 'اتصال',
    processando: 'جار التحقق من الرموز...',
    user_placeholder: 'اسم المستخدم أو البريد أو الهاتف',
    password_placeholder: 'كلمة المرور',
    or_connect: 'أو قم بالاتصال الخارجي عبر:',
    no_account: 'ليس لديك حساب؟ بادر بالانضمام',
    forgot_password: 'فقدان كلمة المرور',
    reg_title: 'إنشاء ملف تواصل إنفيس جديد',
    full_name_label: 'الاسم الكامل',
    nickname_label: 'الاسم المستعار (5-10 أحرف)',
    email_label: 'البريد الإلكتروني',
    phone_label: 'رقم الهاتف (9 أرقام)',
    password_reg_label: 'رمز المرور (6 خانات + رمز)',
    create_btn: 'تأكيد وتوقيع ملف البيانات',
    age_label: 'ما هو تاريخ ميلادك الكامل؟',
    coppa_note: 'هذه المعلومات محمية وغير قابلة للتعديل للحماية القانونية.',
    accept_btn: 'موافق وأوقع الاتفاقية',
    read_scroll: 'اسحب للأسفل لقراءة بنود العقد كاملة',
    active_tasks_msg: 'النظام لا يمتلك أي نوافذ نشطة حاليا.',
    wallet_title: 'المحفظة الإلكترونية',
    fiat_conv_title: 'تحويل الأصول والعملات',
    fiat_min_withdraw: 'الحد الأدنى للسحب الفوري: R$ 20,00',
    btn_withdraw: 'إرسال طلب السحب',
    btn_back: 'رجوع',
    donate_msg: 'تبرعك السخي يمكننا من تغطية تكاليف الخادم والاستمرارية.',
    btn_copy: 'نسخ الكود',
    copied: 'تم نسخ كود الأمان بنجاح !',
    logout: 'قطع الاتصال',
    cancel: 'إلغاء العملية',
    rec_title: 'استرداد كلمة المرور',
    enter_email: 'البريد الإلكتروني المسجل لدينا',
    enter_name: 'أدخل اسمك الأول للمطابقة الأمنية',
    rec_success: 'سيرسل رمز المرور الجديد لعنوانك في غضون 12 ساعة.',
    blocks_limit: 'تم بلوغ الحد الأقصى للمهام المفتوحة (3 مهام).',
    fingerprint_text: 'بصمة حساسة طيفيا'
  ,
    login_err_empty: 'E-mail and password are required.',
    login_auth: 'Authenticating in Matrix...',
    login_err_invalid: 'Invalid E-mail or password.',
    reg_err_name: 'Full Name must have at least 15 characters.',
    reg_err_email: 'Invalid e-mail format.',
    reg_err_nick: 'Nickname must have 5-10 characters.',
    reg_err_birth: 'Provide a valid Date of Birth.',
    reg_err_pass: 'Your password does not meet the criteria.',
    reg_req_min: 'Min 6 characters',
    reg_req_upper: 'Uppercase Letter',
    reg_req_lower: 'Lowercase Letter',
    reg_req_num: 'One digit',
    reg_req_spec: 'Special (@$!%*?&)',
    back_login: 'Back to Login',
    reg_subtitle: 'INVIS Standard Blind Registration',
    panel_title: 'INVIS CORE PANEL',
    withdraw_bal: 'Withdrawable Balance:',
    tech_level: 'Tech Level:',
    aura_title: 'Device Chromatic Aura',
    upgrade_title: 'Productivity Contracts',
    metrics_title: 'MATRIX CONNECTION METRICS',
    end_session: 'END SESSION'
  },
  'hi-IN': {
    welcome: 'इन्वीस इकोसिस्टम',
    status_msg: 'सिंक्रोनाइज़्ड डेटा मैट्रिक्स',
    hint: 'कमांड शुरू करने के लिए फुट पर व्हील घुमाएं',
    loading: 'सुरक्षा मैट्रिक्स लोड हो रहा है...',
    lock: 'गणितीय सुरक्षा लॉक',
    digital_id: 'बायोमेट्रिक प्रमाणीकरण पूर्ण',
    toque_para_acessar: 'दबाकर सिस्टम चालू करें',
    login_title: 'लॉगिन',
    login_btn: 'सिस्टम से जुड़ें',
    processando: 'चैनल सत्यापित हो रहा है...',
    user_placeholder: 'यूज़रनेम, ईमेल या मोबाइल नंबर',
    password_placeholder: 'गुप्त कोड (पासवर्ड)',
    or_connect: 'या अन्य विकल्प से लॉगिन करें:',
    no_account: 'डिजिटल खाता नहीं है? तुरंत रजिस्टर करें',
    forgot_password: 'गुप्त कोड भूल गए',
    reg_title: 'नया इन्वीस डिजिटल खाता बनाएं',
    full_name_label: 'पूरा नाम',
    nickname_label: 'उपनाम (5-10 वर्ग)',
    email_label: 'ईमेल पता',
    phone_label: 'मोबाइल नंबर (9 डिजिट)',
    password_reg_label: 'गुप्त पासवर्ड (न्यूनतम 6 वर्ग + सिंबल)',
    create_btn: 'डिजिटल खाते पर हस्ताक्षर करें',
    age_label: 'आपकी जन्मतिथि क्या है?',
    coppa_note: 'यह जानकारी कानूनी सुरक्षा कारणों से बदली नहीं जा सकती है।',
    accept_btn: 'मैं स्वीकार और हस्ताक्षरित करता हूँ',
    read_scroll: 'सहमति के लिए दस्तावेज़ को अंत तक स्क्रॉल करें',
    active_tasks_msg: 'पोर्ट पर कोई क्रियाशील विंडो उपलब्ध नहीं है।',
    wallet_title: 'डिजिटल वॉलेट कार्ड',
    fiat_conv_title: 'फिएट मुद्रा कनवर्टर',
    fiat_min_withdraw: 'न्यूनतम निकासी सीमा: R$ 20,00',
    btn_withdraw: 'निकासी प्रक्रिया शुरू करें',
    btn_back: 'पीछे जाएँ',
    donate_msg: 'आपका दान बिना किसी मध्यस्थ सर्वर के सहयोग में जाएगा।',
    btn_copy: 'कोड कॉपी करें',
    copied: 'सफलतापूर्वक क्लिपबोर्ड पर सहेजा गया !',
    logout: 'संपर्क विच्छेद',
    cancel: 'क्रिया निरस्त करें',
    rec_title: 'पासवर्ड पुनःप्राप्ति',
    enter_email: 'कृपया अपना नामांकित ईमेल दर्ज करें',
    enter_name: 'पुष्टि के लिए अपना प्रथम नाम प्रेषित करें',
    rec_success: 'नया पासवर्ड 12 घंटे के भीतर आपके बैकअप ईमेल पर भेजा जाएगा।',
    blocks_limit: 'तीन विंडो की अधिकतम सीमा पूरी हो चुकी है। अनुपयोगी विंडो बंद करें।',
    fingerprint_text: 'सूक्ष्म फ़िंगरप्रिंट स्कैनर'
  ,
    login_err_empty: 'E-mail and password are required.',
    login_auth: 'Authenticating in Matrix...',
    login_err_invalid: 'Invalid E-mail or password.',
    reg_err_name: 'Full Name must have at least 15 characters.',
    reg_err_email: 'Invalid e-mail format.',
    reg_err_nick: 'Nickname must have 5-10 characters.',
    reg_err_birth: 'Provide a valid Date of Birth.',
    reg_err_pass: 'Your password does not meet the criteria.',
    reg_req_min: 'Min 6 characters',
    reg_req_upper: 'Uppercase Letter',
    reg_req_lower: 'Lowercase Letter',
    reg_req_num: 'One digit',
    reg_req_spec: 'Special (@$!%*?&)',
    back_login: 'Back to Login',
    reg_subtitle: 'INVIS Standard Blind Registration',
    panel_title: 'INVIS CORE PANEL',
    withdraw_bal: 'Withdrawable Balance:',
    tech_level: 'Tech Level:',
    aura_title: 'Device Chromatic Aura',
    upgrade_title: 'Productivity Contracts',
    metrics_title: 'MATRIX CONNECTION METRICS',
    end_session: 'END SESSION'
  },
  'ko-KR': {
    welcome: 'INVIS 마트릭스 시스템',
    status_msg: '코어 네트워킹 마스터 전송',
    hint: '작업 명령은 하단의 컨트롤러를 회전',
    loading: '인증 인젝터 점검 중...',
    lock: '수학적 마이크로 도어록',
    digital_id: '지문 정보 복호화 인증됨',
    toque_para_acessar: '접속 인터페이스 로드',
    login_title: '로그인',
    login_btn: '중앙 단말기 접속',
    processando: '세션 확인 중...',
    user_placeholder: '계정 ID, 이메일 주소, 또는 무선 전화번호',
    password_placeholder: '보안 메커니즘 패스워드',
    or_connect: '간편 네트워크 접근:',
    no_account: '네트워크 어드레스가 없으십니까? 생성하기',
    forgot_password: '보안 키 유실',
    reg_title: '신규 가입단말기 노드 설정',
    full_name_label: '실명 (성함 전체)',
    nickname_label: '단말 식별자 (5-10자 내외)',
    email_label: '인증용 이메일 주소',
    phone_label: '국제전화 번호 (9자리)',
    password_reg_label: '키 패스워드 (6자리 이상 + 문자 기호)',
    create_btn: '신규 블록 로드 요청',
    age_label: '귀하의 실제 생년월일을 제공하십시오',
    coppa_note: '생년월일은 본인확인용 마스터 키로 영구히 재설정이 제한됩니다.',
    accept_btn: '동의 승인 및 디지털 서명',
    read_scroll: '라이선스를 끝까지 스크롤하여 서명 활성화',
    active_tasks_msg: '열려 있는 활성 블록 태스크가 비어 있습니다.',
    wallet_title: '디지털 암호 지갑카드',
    fiat_conv_title: '현금 환산 계산기',
    fiat_min_withdraw: '최소 현금 환급액: R$ 20,00',
    btn_withdraw: '계정 자산 출금 실행',
    btn_back: '이전 단계 이동',
    donate_msg: '자발적 후원금은 마트릭스 노드 대역폭 증설에 활용됩니다.',
    btn_copy: '복사',
    copied: '클립보드에 키가 적재되었습니다!',
    logout: '보안 연결 해제',
    cancel: '취소',
    rec_title: '연결 암호 복원',
    enter_email: '연결되어 등록된 전자 우편 입력',
    enter_name: '동일인 판단을 위해 이름(영문/한글 원명) 입력',
    rec_success: '리셋 로그인 패스워드가 12시간 이내 목적 이메일로 송부됩니다.',
    blocks_limit: '멀티태스킹 3단 레이아웃 초과. 열린 작업을 줄이십시오.',
    fingerprint_text: '미세 지문 스캐너'
  ,
    login_err_empty: 'E-mail and password are required.',
    login_auth: 'Authenticating in Matrix...',
    login_err_invalid: 'Invalid E-mail or password.',
    reg_err_name: 'Full Name must have at least 15 characters.',
    reg_err_email: 'Invalid e-mail format.',
    reg_err_nick: 'Nickname must have 5-10 characters.',
    reg_err_birth: 'Provide a valid Date of Birth.',
    reg_err_pass: 'Your password does not meet the criteria.',
    reg_req_min: 'Min 6 characters',
    reg_req_upper: 'Uppercase Letter',
    reg_req_lower: 'Lowercase Letter',
    reg_req_num: 'One digit',
    reg_req_spec: 'Special (@$!%*?&)',
    back_login: 'Back to Login',
    reg_subtitle: 'INVIS Standard Blind Registration',
    panel_title: 'INVIS CORE PANEL',
    withdraw_bal: 'Withdrawable Balance:',
    tech_level: 'Tech Level:',
    aura_title: 'Device Chromatic Aura',
    upgrade_title: 'Productivity Contracts',
    metrics_title: 'MATRIX CONNECTION METRICS',
    end_session: 'END SESSION'
  }
};

// Comprehensive list of INVIShop items, with double prices (IC$ and US$ equivalent, rate of 2500 ic = R$ 1.00)
export const INVI_CATALOG_ITEMS = [
  // SALAS E AMBIENTES (Multiplex)
  { id: '001', name: 'Sala de Leitura Neural', category: 'Multiplex — Leitura Neural', priceIC: 4500, priceFiat: 1.80, capacity: 'HOST + 1', duration: '15 Minutos', description: 'Abre uma sala de leitura sincronizada com narração de IA Neural Edge.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '002', name: 'Sala de Leitura Neural Duo', category: 'Multiplex — Leitura Neural', priceIC: 5250, priceFiat: 2.10, capacity: 'HOST + 2', duration: '15 Minutos', description: 'Abre uma sala de leitura sincronizada para até 3 leitores simultâneos com narração neural.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '003', name: 'Leitura Neural Master', category: 'Multiplex — Leitura Neural', priceIC: 9000, priceFiat: 3.60, capacity: 'HOST + 1', duration: '30 Minutos', description: 'Leitura estendida de 30 minutos com buffer dinâmico de carregamento invisível.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '019', name: 'Sala de Jogos INVIS Play', category: 'Multiplex — Jogos', priceIC: 9000, priceFiat: 3.60, capacity: 'HOST + 1', duration: '20 Minutos', description: 'Abre sala com chat de voz WebRTC integrado sobre jogos HTML5.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '020', name: 'Sala de Jogos Trio', category: 'Multiplex — Jogos', priceIC: 10500, priceFiat: 4.20, capacity: 'HOST + 2', duration: '20 Minutos', description: 'Fila de turnos WebRTC para 3 jogadores simultâneos.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '025', name: 'Sala de Filmes Multiplex', category: 'Multiplex — Filmes / Vídeos', priceIC: 18000, priceFiat: 7.20, capacity: 'HOST + 1', duration: '40 Minutos', description: 'Assistam juntos em perfeita sincronia com marcadores de tempo de matriz.', minTier: 'FREE', requiresItem: '', isStamped: false },
  
  // MOLDURAS (Cosméticos / Tiers)
  { id: '040', name: 'Moldura de Páscoa', category: 'Premium — Moldura de Perfil', priceIC: 12500, priceFiat: 5.00, capacity: 'Individual', duration: 'Vitalício', description: 'Estética temática com tons pastéis integrados ao neon rosa e arco de ovos de cristal.', minTier: 'VIP1', requiresItem: '', isStamped: true },
  { id: '041', name: 'Moldura de Natal', category: 'Premium — Moldura de Perfil', priceIC: 12500, priceFiat: 5.00, capacity: 'Individual', duration: 'Vitalício', description: 'Glow neon vermelho e verde rubi brilhante constante sobre o avatar.', minTier: 'VIP1', requiresItem: '', isStamped: true },
  { id: '042', name: 'Moldura de Praia', category: 'Premium — Moldura de Perfil', priceIC: 5750, priceFiat: 2.30, capacity: 'Individual', duration: 'Vitalício', description: 'Estética tropical com profundidade Z-axis e bordas Azul Piscina vivo.', minTier: 'VIP1', requiresItem: '', isStamped: true },
  { id: '043', name: 'Moldura de Leitor', category: 'Premium — Moldura de Perfil', priceIC: 15000, priceFiat: 6.00, capacity: 'Individual', duration: 'Vitalício', description: 'Composição elegante de livros em filigrana de ouro que destaca o perfil do leitor.', minTier: 'VIP1', requiresItem: '', isStamped: true },
  { id: '044', name: 'Moldura de Escritor', category: 'Premium — Moldura de Perfil', priceIC: 15000, priceFiat: 6.00, capacity: 'Individual', duration: 'Vitalício', description: 'Destaque luxuoso de tinteiro digital e pena de ouro que emana um rastro de luz de neon.', minTier: 'VIP1', requiresItem: '', isStamped: true },
  { id: '046', name: 'Moldura de Fada', category: 'Premium — Moldura de Perfil', priceIC: 7250, priceFiat: 2.90, capacity: 'Individual', duration: 'Vitalício', description: 'Asas de borboleta neon com sutil poeira estelar cintilante integrada.', minTier: 'VIP1', requiresItem: '', isStamped: true },
  { id: '047', name: 'Moldura de Caveira', category: 'Premium — Moldura de Perfil', priceIC: 15000, priceFiat: 6.00, capacity: 'Individual', duration: 'Vitalício', description: 'Contorno de crânios góticos estilizados unidos por um brilho Púrpura Épico.', minTier: 'VIP1', requiresItem: '', isStamped: true },
  { id: '050', name: 'Moldura de Rubi (Rara)', category: 'Premium — Moldura de Perfil', priceIC: 20000, priceFiat: 8.00, capacity: 'Individual', duration: 'Vitalício', description: 'Aro cravejado de rubis lapidados emitindo pulsos intensos Vermelho Carmesim.', minTier: 'VIP1', requiresItem: '', isStamped: true },
  { id: '051', name: 'Moldura de Diamante (Lendária)', category: 'Premium — Moldura de Perfil', priceIC: 30000, priceFiat: 12.00, capacity: 'Individual', duration: 'Vitalício', description: 'A caneta de diamante máxima. Design cristalino com refração prismática e selo LENDÁRIO público.', minTier: 'VIP1', requiresItem: '', isStamped: true },
  
  // MOLDURAS PADRÃO / FREE (IDs 155-158)
  { id: '155', name: 'Moldura de Rosas', category: 'INVIShop — Moldura de Perfil (Free)', priceIC: 3250, priceFiat: 1.30, capacity: 'Individual', duration: 'Vitalício', description: 'Anel floral sutil de rosas vermelhas digitalizado com fusão de escuridão.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '156', name: 'Moldura de Fogo', category: 'INVIShop — Moldura de Perfil (Free)', priceIC: 2250, priceFiat: 0.90, capacity: 'Individual', duration: 'Vitalício', description: 'Chamas animadas que cercam a foto de perfil com brilho agressivo.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '157', name: 'Moldura de Ouro', category: 'INVIShop — Moldura de Perfil (Free)', priceIC: 1250, priceFiat: 0.50, capacity: 'Individual', duration: 'Vitalício', description: 'Aro fino polido de ouro com reflexos de metais nobres constantes.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '158', name: 'Moldura de Prata', category: 'INVIShop — Moldura de Perfil (Free)', priceIC: 500, priceFiat: 0.20, capacity: 'Individual', duration: 'Vitalício', description: 'O item mais econômico, constituído de aço inoxidável reflexivo suave.', minTier: 'FREE', requiresItem: '', isStamped: false },

  // PRESENTES (Status Social)
  { id: '115', name: 'Rosa', category: 'Itens de Presente — Status Social INVIS', priceIC: 200, priceFiat: 0.08, capacity: 'Individual', duration: '24 Horas', description: 'Uma rosa digital simples com moldura de afeto.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '116', name: 'Buquê de Flores', category: 'Itens de Presente — Status Social INVIS', priceIC: 750, priceFiat: 0.30, capacity: 'Individual', duration: '48 Horas', description: 'Elegante buquê para aumentar o engajamento com amigos.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '117', name: 'Sanduíche', category: 'Itens de Presente — Status Social INVIS', priceIC: 300, priceFiat: 0.12, capacity: 'Individual', duration: '6 Horas', description: 'Sanduíche virtual para brincadeiras humorísticas nas caixas do fórum.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '118', name: 'X-Salada', category: 'Itens de Presente — Status Social INVIS', priceIC: 500, priceFiat: 0.20, capacity: 'Individual', duration: '6 Horas', description: 'X-salada gastronômico de alta resolução de imagem.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '119', name: 'Bisteca', category: 'Itens de Presente — Status Social INVIS', priceIC: 500, priceFiat: 0.20, capacity: 'Individual', duration: '6 Horas', description: 'Bisteca virtual para churrascos nas salas Multiplex.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '120', name: 'Relógio de Luxo', category: 'Itens de Presente — Status Social INVIS', priceIC: 750, priceFiat: 0.30, capacity: 'Individual', duration: '72 Horas', description: 'Relógio requintado para presentear usuários Elite.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '121', name: 'Antibiótico virtual', category: 'Itens de Presente — Status Social INVIS', priceIC: 875, priceFiat: 0.35, capacity: 'Individual', duration: '12 Horas', description: 'Medicamento bem-humorado descontraído para o mural.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '122', name: 'Cama confort', category: 'Itens de Presente — Status Social INVIS', priceIC: 450, priceFiat: 0.18, capacity: 'Individual', duration: '24 Horas', description: 'Sugere relaxamento no chat para amigos.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '127', name: 'Bola de Laser', category: 'Itens de Presente — Status Social INVIS', priceIC: 2250, priceFiat: 0.90, capacity: 'Individual', duration: '24 Horas', description: 'Bola esportiva geradora de partículas de neon no perfil.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '128', name: 'Fogos de Artifício', category: 'Itens de Presente — Status Social INVIS', priceIC: 5250, priceFiat: 2.10, capacity: 'Individual', duration: '72 Horas', description: 'Dispara um show de luzes na tela do receptor ao receber o item.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '129', name: 'Saco de Moedas', category: 'Itens de Presente — Status Social INVIS', priceIC: 8250, priceFiat: 3.30, capacity: 'Individual', duration: '72 Horas', description: 'Indica nobreza e generosidade, com luzes de fada no topo.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '131', name: 'Cédula Real', category: 'Itens de Presente — Status Social INVIS', priceIC: 12500, priceFiat: 5.00, capacity: 'Individual', duration: '5 Dias', description: 'Badge premium mais duradouro e cobiçado de prestígio.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '134', name: 'Astronauta Holográfico', category: 'Itens de Presente — Status Social INVIS', priceIC: 15000, priceFiat: 6.00, capacity: 'Individual', duration: '7 Dias', description: 'Badge extraordinário animado flutuando no perfil do destinatário.', minTier: 'FREE', requiresItem: '', isStamped: false },
  { id: '136', name: 'Coroa Imperial', category: 'Itens de Presente — Status Social INVIS', priceIC: 24750, priceFiat: 9.90, capacity: 'Individual', duration: '10 Dias', description: 'O item cosmético de presente de maior valor com coroa tridimensional brilhante.', minTier: 'FREE', requiresItem: '', isStamped: false },
  
  // ITENS DE LACUNA REIVINDICADOS (ID 159 CADEIRA)
  { id: '159', name: 'Cadeira do Líder', category: 'Itens de Presente — Status Social INVIS', priceIC: 300, priceFiat: 0.12, capacity: 'Individual', duration: '12 Horas', description: 'Simboliza que o usuário está confortável na comunidade do ecossistema.', minTier: 'FREE', requiresItem: '', isStamped: false }
];

export const MOCK_BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    tags: ['Neural', 'Classic'],
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80',
    minTier: 'FREE',
    isNeural: true,
    content: [
      'Capítulo 1: Do título. Uma noite destas, vindo da cidade para o Engenho Novo, encontrei no trem da Central um rapaz aqui do bairro, que eu conheço de vista e de chapéu. Cumprimentou-me, sentou-se ao pé de mim, falou do tempo, dos partidos políticos e das eleições. Chamavam-lhe o poeta da Central.',
      'Capítulo 2: Do livro. Recebi um convite do destino para escrever estas memórias. A imaginação me assalta e trago nas minhas veias a melancolia do esquecimento. Meus dias de juventude brilham fracos no espelho, mas a lembrança de Capitu supera a ferrugem do tempo.',
      'Capítulo 3: Dos olhos de ressaca. Havia uma força secreta no olhar de Capitu de que eu não conseguia desviar. Como o mar que puxa a areia de volta na ressaca, seus olhos possuíam uma profundidade misteriosa e indizível.'
    ]
  },
  {
    id: 'b2',
    title: 'A Divina Comédia',
    author: 'Dante Alighieri',
    tags: ['Classic', 'Premium'],
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80',
    minTier: 'VIP1',
    isNeural: true,
    content: [
      'Canto I: No meio do caminho de nossa vida, me encontrei em uma selva escura, pois a via direta se perdera. Ah, como é difícil dizer o que era essa selva tão selvagem, áspera e forte, cuja lembrança renova o medo.',
      'Canto II: O dia se afastava, e o ar escurecido libertava os seres vivos da terra de suas fadigas cotidianas; e eu, só, me preparava para enfrentar a jornada das visões incríveis e profundas.'
    ]
  },
  {
    id: 'b3',
    title: 'O Astronauta Perdido',
    author: 'IA Ghostwriter',
    tags: ['Neural', 'Geração IA'],
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    minTier: 'FREE',
    isNeural: true,
    isGhostwriter: true,
    content: [
      'Capítulo Inicial: No vácuo silencioso acima de Marte, os motores da Genesis-8 falharam. Sem contato com a Terra, sem propulsores, a deriva começou. O infinito estrelado parecia um manto silencioso observando a insignificância de um homem.'
    ]
  }
];

export const MOCK_MOVIES: Movie[] = [
  {
    id: 'm1',
    title: 'Cosmic Journey - Sci-Fi Trailer',
    year: 2026,
    posterUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80',
    overview: 'Uma odisseia épica pelos confins de galáxias inexploradas, expandindo nossa compreensão de física de fendas no tempo.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Ricky for fallback / mock playback
    type: 'trailer',
    status: true
  },
  {
    id: 'm2',
    title: 'The Silent Sea - Ocean Documental',
    year: 2025,
    posterUrl: 'https://images.unsplash.com/photo-1518826778787-43cd2931156b?w=400&auto=format&fit=crop&q=80',
    overview: 'Exploração visual dos canais submarinos intocados sob a perspectiva do eco-balanço marinho.',
    videoUrl: 'https://www.youtube.com/embed/S263370JNby',
    type: 'filme',
    status: true
  },
  {
    id: 'm3',
    title: 'Cyberpunk Neon Matrix Series',
    year: 2026,
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
    overview: 'Nas sombras da cidade sob controle do API Gateway, hackers lutam para reconquistar a liberdade.',
    videoUrl: 'https://www.youtube.com/embed/eyJhbGciOiJ',
    type: 'serie',
    status: true
  }
];

interface InvisContextType {
  currentStage: 'locks' | 'login' | 'register' | 'onboarding_age' | 'onboarding_terms' | 'dashboard' | 'recovery';
  setStage: (stage: 'locks' | 'login' | 'register' | 'onboarding_age' | 'onboarding_terms' | 'dashboard' | 'recovery') => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  wallet: WalletState;
  setWallet: React.Dispatch<React.SetStateAction<WalletState>>;
  transactions: Transaction[];
  addTransaction: (tx: Partial<Transaction>) => void;
  activeBlocks: DashboardBlock[];
  isNavVisible: boolean;
  setIsNavVisible: (visible: boolean) => void;
  isMediaPipMode: boolean;
  showPipModal: boolean;
  mediaResumeTrigger: number;
  triggerMediaResume: () => void;
  mediaIsPlaying: boolean;
  setMediaIsPlaying: (v: boolean) => void;
  setShowPipModal: (v: boolean) => void;
  setIsMediaPipMode: (v: boolean) => void;
  addBlock: (type: BlockType, title: string, bypassSelection?: boolean) => void;
  minimizeBlock: (id: string) => void;
  restoreBlock: (id: string) => void;
  closeBlock: (id: string) => void;
  swapBlocks: (indexA: number, indexB: number) => void;
  togglePin: (id: string) => void;
  language: keyof typeof DICTIONARY;
  setLanguage: (lang: keyof typeof DICTIONARY) => void;
  isLangDrawerOpen: boolean;
  setLangDrawerOpen: (open: boolean) => void;
  inventory: InventoryItem[];
  buyItem: (item: typeof INVI_CATALOG_ITEMS[0], payWithSilver: boolean) => { success: boolean; error?: string };
  useInventoryItem: (indexId: string) => void;
  sellInventoryItem: (indexId: string) => void;
  donateInventoryItem: (indexId: string, recipientName: string) => { success: boolean; error?: string };
  isCoinGolden: boolean;
  setCoinGolden: (golden: boolean) => void;
  systemStatus: string;
  setSystemStatus: (status: string) => void;
  activeSession: 'Game' | 'Library' | null;
  setActiveSession: (session: 'Game' | 'Library' | null) => void;
  currentDuckingLevel: number;
  setDuckingLevel: (level: number) => void;
  selectedSupportPage: 'privacidade' | 'termos' | 'exclusao' | null;
  setSelectedSupportPage: (page: 'privacidade' | 'termos' | 'exclusao' | null) => void;
  selectedBookId: string | null;
  setSelectedBookId: (id: string | null) => void;
  selectedMovieId: string | null;
  setSelectedMovieId: (id: string | null) => void;
  triggerChronCleanup: () => void;
  hasVisitedOnce: boolean;
  setVisitedOnce: (visited: boolean) => void;
  customAIChapters: string[];
  addAIChapter: (text: string) => void;
  activeFrameId: string;
  hubSelectionPending: { type: BlockType; title: string } | null;
  setHubSelectionPending: (pending: { type: BlockType; title: string } | null) => void;
  socialSubTab: 'chat' | 'forum';
  setSocialSubTab: (tab: 'chat' | 'forum') => void;
  librarySubTab: 'books' | 'ghostwriter';
  setLibrarySubTab: (tab: 'books' | 'ghostwriter') => void;
  mediaSubTab: 'videotube' | 'movies' | 'music';
  setMediaSubTab: (tab: 'videotube' | 'movies' | 'music') => void;
  gamesSubTab: 'invis' | 'fast' | 'most';
  setGamesSubTab: (tab: 'invis' | 'fast' | 'most') => void;
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  isMediaHubSelectorOpen: boolean;
  setMediaHubSelectorOpen: (open: boolean) => void;
}

const InvisContext = createContext<InvisContextType | undefined>(undefined);

export const InvisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStage, setStage] = useState<'locks' | 'login' | 'register' | 'onboarding_age' | 'onboarding_terms' | 'dashboard' | 'recovery'>('locks');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [language, setLanguage] = useState<keyof typeof DICTIONARY>('pt-BR');
  const [isLangDrawerOpen, setLangDrawerOpen] = useState(false);
  const [isCoinGolden, setCoinGolden] = useState(true);
  const [systemStatus, setSystemStatus] = useState('Sincronizado');
  const [activeSession, setActiveSession] = useState<'Game' | 'Library' | null>(null);
  const [currentDuckingLevel, setDuckingLevel] = useState(60); // Percentage Reduction
  const [selectedSupportPage, setSelectedSupportPage] = useState<'privacidade' | 'termos' | 'exclusao' | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [hasVisitedOnce, setVisitedOnce] = useState(false);
  const [customAIChapters, setCustomAIChapters] = useState<string[]>([]);
  const [activeFrameId, setActiveFrameId] = useState('frame_matrix');

  // Hub Selection & Sub Tabs States
  const [hubSelectionPending, setHubSelectionPending] = useState<{ type: BlockType; title: string } | null>(null);
  const [socialSubTab, setSocialSubTab] = useState<'chat' | 'forum'>('chat');
  const [librarySubTab, setLibrarySubTab] = useState<'books' | 'ghostwriter'>('books');
  const [mediaSubTab, setMediaSubTab] = useState<'videotube' | 'movies' | 'music'>('videotube');
  const [gamesSubTab, setGamesSubTab] = useState<'invis' | 'fast' | 'most'>('fast');
  const [isMediaHubSelectorOpen, setMediaHubSelectorOpen] = useState(false);

  // Toast notifications list state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Replace default alert in some contexts securely without breaking
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg: string) => {
      let type: 'success' | 'error' | 'info' = 'info';
      if (msg.includes('Sucesso') || msg.includes('sucesso') || msg.includes('Parabéns') || msg.includes('adquiriu') || msg.includes('enviado')) {
        type = 'success';
      } else if (msg.includes('Falha') || msg.includes('insuficiente') || msg.includes('Erro') || msg.includes('erro') || msg.includes('erro_auth')) {
        type = 'error';
      }
      showToast(msg, type);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  // Dual-Wallet Core: starts with 12500 ic (equivalent to R$ 5.00) in wallet
  const [wallet, setWallet] = useState<WalletState>({
    icGold: 5000.0000000000,
    icSilver: 0.0000000000,
    pendingAffiliateBalance: 0
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'Bonus', amount: '+5000.0000', desc: 'Bônus de Boas-Vindas da Matriz', date: 'Hoje' },
    { id: '2', type: 'Gain', amount: '+0.0001250', desc: 'Mineração Ativa Inicial', date: 'Hoje' }
  ]);

  const [activeBlocks, setActiveBlocks] = useState<DashboardBlock[]>([]);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isMediaPipMode, setIsMediaPipMode] = useState(false);
  const [showPipModal, setShowPipModal] = useState(false);
  const [mediaResumeTrigger, setMediaResumeTrigger] = useState(0);
  const [mediaIsPlaying, setMediaIsPlaying] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Supabase Real-time Auth Persistence and Synchronization Hook
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    
    // Initial fetch to restore session if app was reloaded
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
         fetchAndSetUser(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            fetchAndSetUser(session.user);
         } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            setStage('login');
         }
      }
    );
    
    return () => {
       authListener.subscription.unsubscribe();
    }
  }, []);

  const fetchAndSetUser = async (user: any) => {
      const profile = await SupabaseService.getProfile(user.id);
      if (profile) {
          setCurrentUser({
            id: user.id,
            fullName: profile.full_name || 'Fundador INVIS Cérebro',
            nickname: profile.nickname || user.email?.split('@')[0] || 'User',
            email: user.email,
            phone: profile.phone || '+5511999999999',
            ddi: profile.ddi || '+55',
            birthDate: profile.birth_date || '1995-10-31',
            age: profile.age || 30,
            tier: profile.tier || 'FREE',
            ageGroup: (profile.age || 30) < 18 ? 'Kids' : 'Adult',
            isActive: true,
            termsAccepted: true,
            biometricsActive: false
          });
          
          if (profile.wallet_ic_gold !== undefined) {
             setWallet(prev => ({ ...prev, icGold: profile.wallet_ic_gold, icSilver: profile.wallet_ic_silver }));
          }
          setStage('dashboard');
      } else {
          // System Y Logic: User logged in via OAuth but does NOT exist in invis DB (profiles).
          SupabaseService.signOut().then(() => {
             setCurrentUser(null);
             localStorage.setItem('invis_oauth_error', 'not_found');
             window.dispatchEvent(new Event('invis_oauth_not_found'));
          });
      }
  };

  // Local storage cache hooks for visitors / persistence
  useEffect(() => {
    const savedDOB = localStorage.getItem('invis_dob');
    const savedLang = localStorage.getItem('invis_lang') as keyof typeof DICTIONARY;
    const visited = localStorage.getItem('invis_visited');

    if (savedLang && DICTIONARY[savedLang]) {
      setLanguage(savedLang);
    }
    if (visited === 'true') {
      setVisitedOnce(true);
    }
  }, []);

  // Supabase User Data Sync hook
  useEffect(() => {
    if (!currentUser) return;

    const syncUserData = async () => {
      if (isSupabaseConfigured()) {
        const profile = await SupabaseService.getProfile(currentUser.id);
        if (profile) {
          setCurrentUser(prev => prev ? {
            ...prev,
            tier: (profile.tier as any) || prev.tier,
          } : null);
          setWallet({
            icGold: profile.wallet_ic_gold ?? 5000.0,
            icSilver: profile.wallet_ic_silver ?? 0.0,
            pendingAffiliateBalance: 0
          });
        }

        // Fetch user financial logs
        const dbTxs = await SupabaseService.fetchTransactions(currentUser.id);
        if (dbTxs) {
          setTransactions(dbTxs);
        }

        // Fetch user inventory items
        const dbInv = await SupabaseService.fetchInventory(currentUser.id);
        if (dbInv) {
          setInventory(dbInv);
        }
      }
    };

    syncUserData();
  }, [currentUser?.id]);

  const addTransaction = (tx: Partial<Transaction>) => {
    const newTx: Transaction = {
      id: Math.random().toString(),
      type: tx.type || 'Gain',
      amount: tx.amount || '+0.0000000000',
      desc: tx.desc || 'Transação INVIS',
      date: 'Agora'
    };
    setTransactions(prev => [newTx, ...prev]);

    // Update to Supabase if logged in
    if (currentUser?.id && isSupabaseConfigured()) {
      SupabaseService.insertTransaction(currentUser.id, newTx);
    }
  };

  // Block management
  const addBlock = (type: BlockType, title: string, bypassSelection?: boolean) => {
    // Check if the block of this type already exists to prevent duplicate hubs
    const existing = activeBlocks.find(b => b.type === type);
    if (existing) {
      if (existing.minimized) {
        setActiveBlocks(prev => prev.map(b => b.id === existing.id ? { ...b, minimized: false } : b));
      }
      setSystemStatus('Bloco Reservado / Focado');
      return;
    }

    if (['social', 'library', 'games'].includes(type) && !bypassSelection) {
      setHubSelectionPending({ type, title });
      return;
    }
    if (activeBlocks.length >= 3) {
      showToast(DICTIONARY[language].blocks_limit, 'error');
      return;
    }
    const newBlock: DashboardBlock = {
      id: `${type}_${Date.now()}`,
      type,
      title: title.toUpperCase(),
      pinned: false
    };
    setActiveBlocks(prev => [...prev, newBlock]);
    setSystemStatus('Bloco Injetado');
  };

  const minimizeBlock = (id: string) => {
    setActiveBlocks(prev => prev.map(b => b.id === id ? { ...b, minimized: true } : b));
    setSystemStatus('Bloco Minimizado');
  };

  const restoreBlock = (id: string) => {
    setActiveBlocks(prev => prev.map(b => b.id === id ? { ...b, minimized: false } : b));
    setSystemStatus('Bloco Restaurado');
  };

  const closeBlock = (id: string) => {
    const target = activeBlocks.find(b => b.id === id);
    if (!target) return;
    setActiveBlocks(prev => prev.filter(b => b.id !== id));
    setSystemStatus('Sincronizado');
  };

  const swapBlocks = (indexA: number, indexB: number) => {
    setActiveBlocks(prev => {
      const copy = [...prev];
      const temp = copy[indexA];
      copy[indexA] = copy[indexB];
      copy[indexB] = temp;
      return copy;
    });
  };

  const togglePin = (id: string) => {
    setActiveBlocks(prev => prev.map(b => b.id === id ? { ...b, pinned: !b.pinned } : b));
  };

  const addAIChapter = (text: string) => {
    setCustomAIChapters(prev => [...prev, text]);
  };

  // Buy Item from INVIShop catalog
  const buyItem = (item: typeof INVI_CATALOG_ITEMS[0], payWithSilver: boolean): { success: boolean; error?: string } => {
    const price = item.priceIC;
    let newGold = wallet.icGold;
    let newSilver = wallet.icSilver;

    if (payWithSilver) {
      if (wallet.icSilver < price) {
        return { success: false, error: 'Saldo de Moeda de Prata insuficiente.' };
      }
      newSilver = wallet.icSilver - price;
    } else {
      if (wallet.icGold < price) {
        return { success: false, error: 'Saldo de moedas mineradas (Gold) insuficiente.' };
      }
      newGold = wallet.icGold - price;
    }

    setWallet({
      icGold: newGold,
      icSilver: newSilver,
      pendingAffiliateBalance: wallet.pendingAffiliateBalance
    });

    if (currentUser?.id && isSupabaseConfigured()) {
      SupabaseService.updateWallet(currentUser.id, newGold, newSilver);
    }

    addTransaction({
      type: 'Spend',
      amount: `-${price.toFixed(4)}`,
      desc: `Compra de ${item.name}`
    });

    const newInvItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      itemId: item.id,
      title: item.name,
      type: item.category.includes('Moldura') ? 'moldura' : item.category.includes('Leitura') ? 'tempo_leitura' : 'presente',
      isStamped: payWithSilver || item.isStamped,
      isUsed: false,
      acquiredAt: new Date().toISOString()
    };

    setInventory(prev => [newInvItem, ...prev]);

    if (currentUser?.id && isSupabaseConfigured()) {
      SupabaseService.insertInventoryItem(currentUser.id, newInvItem);
    }

    return { success: true };
  };

  // Use cosmetic frame or reading timer
  const useInventoryItem = (indexId: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === indexId) {
        if (item.type === 'moldura') {
          setSystemStatus('Cosmético Ativado');
        }

        if (currentUser?.id && isSupabaseConfigured()) {
          SupabaseService.useInventoryItem(currentUser.id, indexId, true);
        }

        return { ...item, isUsed: true };
      }
      return item;
    }));
  };

  // Sell item back with 5% burn penalty
  const sellInventoryItem = (indexId: string) => {
    const item = inventory.find(i => i.id === indexId);
    if (!item) return;

    if (item.isStamped) {
      alert('Contaminação de Moeda de Prata: Itens Stamped não permitem conversão ou venda.');
      return;
    }

    const originalItemRef = INVI_CATALOG_ITEMS.find(c => c.id === item.itemId);
    if (!originalItemRef) return;

    const originalPrice = originalItemRef.priceIC;
    const saleValue = originalPrice * 0.95; // 5% burn
    const burned = originalPrice * 0.05;
    const newGold = wallet.icGold + saleValue;

    setWallet(prev => ({ ...prev, icGold: newGold }));
    setInventory(prev => prev.filter(i => i.id !== indexId));

    if (currentUser?.id && isSupabaseConfigured()) {
      SupabaseService.updateWallet(currentUser.id, newGold, wallet.icSilver);
      SupabaseService.deleteInventoryItem(currentUser.id, indexId);
    }

    addTransaction({
      type: 'Gain',
      amount: `+${saleValue.toFixed(4)}`,
      desc: `Venda de ${item.title} (Queima de ${burned.toFixed(4)} ic)`
    });

    alert(`Item vendido com sucesso por ${saleValue.toFixed(4)} ic. 5% de queima foi eliminada da rede.`);
  };

  // Donate item to a friend
  const donateInventoryItem = (indexId: string, recipientName: string): { success: boolean; error?: string } => {
    const item = inventory.find(i => i.id === indexId);
    if (!item) return { success: false, error: 'Item não encontrado.' };

    setInventory(prev => prev.filter(i => i.id !== indexId));

    if (currentUser?.id && isSupabaseConfigured()) {
      SupabaseService.deleteInventoryItem(currentUser.id, indexId);
    }

    addTransaction({
      type: 'Spend',
      amount: '0.0000',
      desc: `Donativos: Enviou ${item.title} para @${recipientName}`
    });

    alert(`Item ${item.title} enviado com sucesso para ${recipientName}! Seu carimbo de herança is_stamped viajou permanentemente.`);
    return { success: true };
  };

  const triggerChronCleanup = () => {
    setSystemStatus('Higienização Ativada');
    alert('Limpeza de Inatividade Completa: Chat limpo (>90d). Compensação de 500 ic (Moeda de Prata) creditada por sua fidelidade!');
    setWallet(prev => ({ ...prev, icSilver: prev.icSilver + 500 }));
    addTransaction({
      type: 'Bonus',
      amount: '+500.0000',
      desc: 'Bonificação de Higiene do Sistema'
    });
  };

  return (
    <InvisContext.Provider value={{
      currentStage,
      setStage,
      currentUser,
      setCurrentUser,
      wallet,
      setWallet,
      transactions,
      addTransaction,
      activeBlocks,
      isNavVisible,
      setIsNavVisible,
      isMediaPipMode,
      setIsMediaPipMode,
      showPipModal,
      setShowPipModal,
      mediaResumeTrigger,
      triggerMediaResume: () => setMediaResumeTrigger(Date.now()),
      mediaIsPlaying,
      setMediaIsPlaying,
      addBlock,
      minimizeBlock,
      restoreBlock,
      closeBlock,
      swapBlocks,
      togglePin,
      language,
      setLanguage,
      isLangDrawerOpen,
      setLangDrawerOpen,
      inventory,
      buyItem,
      useInventoryItem,
      sellInventoryItem,
      donateInventoryItem,
      isCoinGolden,
      setCoinGolden,
      systemStatus,
      setSystemStatus,
      activeSession,
      setActiveSession,
      currentDuckingLevel,
      setDuckingLevel,
      selectedSupportPage,
      setSelectedSupportPage,
      selectedBookId,
      setSelectedBookId,
      selectedMovieId,
      setSelectedMovieId,
      triggerChronCleanup,
      hasVisitedOnce,
      setVisitedOnce,
      customAIChapters,
      addAIChapter,
      activeFrameId,
      hubSelectionPending,
      setHubSelectionPending,
      socialSubTab,
      setSocialSubTab,
      librarySubTab,
      setLibrarySubTab,
      mediaSubTab,
      setMediaSubTab,
      gamesSubTab,
      setGamesSubTab,
      toasts,
      showToast,
      removeToast,
      isMediaHubSelectorOpen,
      setMediaHubSelectorOpen
    }}>
      {children}
    </InvisContext.Provider>
  );
};

export const useInvis = () => {
  const context = useContext(InvisContext);
  if (!context) {
    throw new Error('useInvis must be used within an InvisProvider');
  }
  return context;
};
