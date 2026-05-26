-- INVIS CORE - SUPABASE SEED DATA SCRIPT
-- Execute nas consultas SQL do painel do Supabase.

-- 1. Tasks iniciais
INSERT INTO public.tasks (user_id, text, completed, priority)
SELECT id, 'Verificar saldo da fatura no Wallet', false, 'high' FROM public.profiles;

INSERT INTO public.tasks (user_id, text, completed, priority)
SELECT id, 'Personalizar opções de avatar no Dashboard', true, 'normal' FROM public.profiles;

INSERT INTO public.tasks (user_id, text, completed, priority)
SELECT id, 'Revisar novos lançamentos no Módulo Mídia', false, 'high' FROM public.profiles;

-- 2. Sistema Social (Mensagens Globais)
INSERT INTO public.messages (sender, avatar, text, lang) VALUES 
('Sistema INVIS', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop&q=80', 'Bem-vindo ao Ecossistema INVIS. Conexões estabilizadas.', 'pt-BR'),
('Global Server', 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=100&auto=format&fit=crop&q=80', 'Syncing complete. Mainnet operational.', 'en-US'),
('Oasis Node', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=100&auto=format&fit=crop&q=80', 'Tokens distribution phase 1 concluded. Enjoy your IC$ Golden.', 'en-US');

-- 3. Histórico de Transações Inicial
INSERT INTO public.transactions (user_id, type, amount, description)
SELECT id, 'deposit', 5000.0, 'Bônus de Registro INVIS Core' FROM public.profiles;

-- 4. Inventário Padrão
INSERT INTO public.inventory (user_id, item_id, title, type, is_stamped)
SELECT id, '040', 'Moldura de Páscoa', 'cosmetic', true FROM public.profiles;

INSERT INTO public.inventory (user_id, item_id, title, type, is_stamped)
SELECT id, '159', 'Cadeira do Líder', 'gift', false FROM public.profiles;

-- Nota: Como o seed das tabelas tasks, transactions, etc. depende de usuários, a melhor forma de iniciar
-- seria após os usuários criarem a conta no Client, mas as queries acima atuam como seed retroativo para
-- os registros existentes em profiles.
