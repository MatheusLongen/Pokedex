import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokemonService } from 'src/app/services/pokemon.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule],
})
export class DetailsPage implements OnInit {
  evolutionTree: any = null;
  pokemon: any;
  name!: string;
  showShiny = false;

  hasMega = false;
  hasGmax = false;
  megaForm: any = null;
  gmaxForm: any = null;
  showMega = false;
  showGmax = false;

  constructor(
    private route: ActivatedRoute,
    private pokeService: PokemonService
  ) {}

  async ngOnInit() {
    this.name = this.route.snapshot.paramMap.get('name') || '';
    this.pokemon = await firstValueFrom(this.pokeService.getPokemonDetails(this.name));

    const species = await firstValueFrom(
      this.pokeService.getPokemonSpecies(this.name.toLowerCase())
    ) as any;

    const chainUrl = species.evolution_chain?.url;
    const evoData = await firstValueFrom(this.pokeService.getEvolutionChainByUrl(chainUrl)) as any;
    const currentNode = this.findEvolutionNode(evoData.chain, this.name.toLowerCase());

    if (currentNode) {
      this.evolutionTree = this.extractEvolutionTree(currentNode);
    }

    const varieties = species.varieties as any[];
    const mega = varieties.find(v => v.pokemon.name.includes('mega'));
    const gmax = varieties.find(v => v.pokemon.name.includes('gmax'));

    if (mega) {
      this.hasMega = true;
      this.megaForm = await firstValueFrom(this.pokeService.getPokemonDetails(mega.pokemon.name));
    }

    if (gmax) {
      this.hasGmax = true;
      this.gmaxForm = await firstValueFrom(this.pokeService.getPokemonDetails(gmax.pokemon.name));
    }
  }

  extractEvolutionTree(node: any): any {
    if (!node?.species?.url) return null;

    const id = this.extractIdFromUrl(node.species.url);

    return {
      name: node.species.name,
      image: id
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
        : 'assets/icon/placeholder.png',
      shinyImage: id
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
        : 'assets/icon/placeholder.png',
      evolvesTo: (node.evolves_to || [])
        .map((child: any) => this.extractEvolutionTree(child))
        .filter(Boolean) // remove nós nulos
    };
  }


  findEvolutionNode(node: any, targetName: string): any | null {
    if (node.species.name.toLowerCase() === targetName) return node;
    for (const child of node.evolves_to || []) {
      const found = this.findEvolutionNode(child, targetName);
      if (found) return found;
    }
    return null;
  }

  extractIdFromUrl(url: string): number {
    const parts = url.split('/');
    return Number(parts[parts.length - 2]);
  }

  toggleMega() {
    this.showMega = !this.showMega;
    if (this.showMega && this.megaForm) {
      this.addAltForm(this.megaForm);
    } else {
      this.removeAltForm('mega');
    }
  }

  toggleGmax() {
    this.showGmax = !this.showGmax;
    if (this.showGmax && this.gmaxForm) {
      this.addAltForm(this.gmaxForm);
    } else {
      this.removeAltForm('gmax');
    }
  }

  addAltForm(form: any) {
    if (!this.evolutionTree || !form?.sprites) return;

    const alreadyAdded = this.evolutionTree.evolvesTo.some((e: any) => e.name === form.name);
    if (alreadyAdded) return;

    const image = form.sprites.front_default || 'assets/icon/placeholder.png';
    const shinyImage = form.sprites.front_shiny || image;

    this.evolutionTree.evolvesTo.push({
      name: form.name,
      image,
      shinyImage,
      evolvesTo: []
    });
  }

  removeAltForm(keyword: 'mega' | 'gmax') {
    if (!this.evolutionTree) return;
    this.evolutionTree.evolvesTo = this.evolutionTree.evolvesTo.filter(
      (e: any) => !e.name.toLowerCase().includes(keyword)
    );
  }

  get firstMoves(): string {
    return this.pokemon?.moves?.slice(0, 5)?.map((m: any) => m.move.name).join(', ') || '';
  }

  get typeList(): string {
    return this.pokemon?.types?.map((t: any) => t.type.name).join(', ') || '';
  }

  get abilitiesList(): string {
    return this.pokemon?.abilities?.map((a: any) => a.ability.name).join(', ') || '';
  }
}