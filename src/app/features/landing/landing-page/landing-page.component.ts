import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { CatalogService, Company } from '../../../core/services/catalog.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonComponent, 
    CardComponent, 
    LeadFormComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './landing-page.component.html',
  styles: [`
    :host {
      display: block;
    }
    .hero-pattern {
      background-image: radial-gradient(#4F46E5 1px, transparent 1px);
      background-size: 32px 32px;
    }
    .blob {
      position: absolute;
      filter: blur(40px);
      z-index: -1;
      opacity: 0.4;
    }
    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out;
    }
    .faq-item.active .faq-answer {
      max-height: 200px;
    }
    .faq-icon {
      transition: transform 0.3s ease;
    }
    .faq-item.active .faq-icon {
      transform: rotate(180deg);
    }
  `]
})
export class LandingPageComponent implements OnInit {
  
  features = [
    {
      title: 'Taxa Zero',
      description: 'Não cobramos comissão sobre suas vendas. O lucro é 100% seu.',
      icon: '💰'
    },
    {
      title: 'Clube de Assinaturas',
      description: 'Crie seu próprio clube para fidelizar clientes e garantir receita recorrente.',
      icon: '🔄'
    },
    {
      title: 'Cupons e Ofertas',
      description: 'Ferramentas completas para criar promoções e atrair mais vendas.',
      icon: '🏷️'
    },
    {
      title: 'Pagamento Direto',
      description: 'O cliente paga diretamente a você. Você define os meios de pagamento aceitos.',
      icon: '🤝'
    },
    {
      title: 'Gestão de Leads',
      description: 'Capture contatos e transforme visitantes em clientes fiéis.',
      icon: '📊'
    },
    {
      title: 'Vitrine Digital',
      description: 'Seus produtos expostos de forma profissional e atraente 24h por dia.',
      icon: '🏪'
    }
  ];

  steps = [
    { 
      num: 1, 
      title: 'Solicite a Demo', 
      desc: 'Preencha o formulário e aguarde o contato de nossa equipe.' 
    },
    { 
      num: 2, 
      title: 'Teste por 15 dias', 
      desc: 'Use todas as funcionalidades gratuitamente. Configure sua loja e comece a vender.' 
    },
    { 
      num: 3, 
      title: 'Decida', 
      desc: 'Gostou? Escolha o plano ideal e continue crescendo com o Adalana.' 
    }
  ];

  faqs = [
    {
      question: 'Preciso cadastrar cartão de crédito para a demo?',
      answer: 'Não! A demo de 15 dias é totalmente gratuita e sem compromisso. Você só precisará definir uma forma de pagamento se decidir continuar após o período de teste.',
      active: false
    },
    {
      question: 'Como recebo pelas minhas vendas?',
      answer: 'Você recebe 100% do valor diretamente do seu cliente. No momento, o Adalana não intermedia pagamentos, permitindo que você negocie livremente (Pix, Dinheiro, Maquininha na entrega).',
      active: false
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim. Não exigimos contratos de fidelidade de longo prazo. Você tem total liberdade para cancelar sua assinatura quando desejar.',
      active: false
    },
    {
      question: 'O sistema serve para qualquer tipo de comércio?',
      answer: 'O Adalana é otimizado para delivery de alimentos e produtos locais. Se você vende algo que pode ser entregue na sua região, o Adalana é para você.',
      active: false
    },
    {
      question: 'Quem faz as entregas?',
      answer: 'Você pode usar seus próprios entregadores ou conectar-se com entregadores parceiros cadastrados na região. Você tem controle total sobre sua logística.',
      active: false
    }
  ];

  comparisons = [
    { feature: 'Taxa por Pedido', adalana: '0%', others: '12% a 30%' },
    { feature: 'Pagamento', adalana: 'Imediato (Direto)', others: 'Até 30 dias' },
    { feature: 'Dados do Cliente', adalana: 'Seus (Exportáveis)', others: 'Do App' },
    { feature: 'Fidelização (Clube)', adalana: 'Sim', others: 'Não/Limitado' },
    { feature: 'Mensalidade', adalana: 'Fixa e Justa', others: 'Variável' }
  ];

  featuredStores: Company[] = [];
  loadingStores = true;

  constructor(
    private title: Title, 
    private meta: Meta,
    private catalogService: CatalogService
  ) {}

  ngOnInit() {
    this.setupSEO();
    this.loadFeaturedStores();
  }

  private setupSEO() {
    this.title.setTitle('Adalana | Plataforma de Delivery Sem Taxas para Empresas');
    this.meta.addTags([
      { name: 'description', content: 'Crie seu delivery próprio sem comissões. Clube de assinaturas, gestão de leads e cupons em uma única plataforma. Teste grátis por 15 dias.' },
      { name: 'keywords', content: 'delivery sem taxas, cardápio digital, clube de assinatura restaurante, sistema delivery, adalana, vendas online' },
      { name: 'author', content: 'Adalana' },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Adalana | A Revolução do Delivery B2B' },
      { property: 'og:description', content: 'Pare de pagar 30% de comissão. Tenha seu próprio canal de vendas com lucro integral.' },
      { property: 'og:image', content: 'assets/images/og-share.jpg' },
      { property: 'og:url', content: 'https://adalana.com.br' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Adalana | Delivery Sem Taxas' },
      { name: 'twitter:description', content: 'Sua vitrine digital, sem comissões por venda. Teste grátis.' }
    ]);
  }

  private loadFeaturedStores() {
    this.loadingStores = true;
    this.catalogService.getActiveCompanies().subscribe({
      next: (companies) => {
        // Pegar as 4 primeiras empresas ativas ou aleatórias
        this.featuredStores = companies.slice(0, 4);
        this.loadingStores = false;
      },
      error: (err) => {
        console.error('Erro ao carregar lojas em destaque', err);
        this.loadingStores = false;
      }
    });
  }

  toggleFaq(index: number) {
    this.faqs[index].active = !this.faqs[index].active;
  }

  scrollToContact() {
    const element = document.getElementById('contact-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getImageUrl(company: Company): string {
    // Prioridade: Banner Customizado -> Imagem da Empresa -> Fallback
    if (company.appearance?.bannerImageUrl) return company.appearance.bannerImageUrl;
    if (company.image_url) return company.image_url;
    // Fallback com SVG inline (data URI) para evitar 404
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TZW0gSW1hZ2VtPC90ZXh0Pjwvc3ZnPg==';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Fallback SVG inline (data URI) - já é o padrão, mas garante que será aplicado em caso de erro
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TZW0gSW1hZ2VtPC90ZXh0Pjwvc3ZnPg==';
    }
  }
}
