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
  pokemon: any;
  name!: string;
  showShiny = false;

  evolutionChain: { name: string; image: string; shinyImage: string }[] = [];

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

    this.pokemon = await firstValueFrom(
      this.pokeService.getPokemonDetails(this.name)
    );

    const species = await firstValueFrom(
      this.pokeService.getPokemonSpecies(this.name)
    ) as any;
    
    const chainUrl = species.evolution_chain.url;

    const evoData = await firstValueFrom(
      this.pokeService.getEvolutionChainByUrl(chainUrl)
    ) as any;

    this.evolutionChain = this.extractEvolutions(evoData.chain);

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

  extractEvolutions(chain: any): { name: string; image: string; shinyImage: string }[] {
    const evolutions = [];
    let current = chain;
    
    while (current) {
      const name = current.species.name;
      const id = this.extractIdFromUrl(current.species.url);

      evolutions.push({
        name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
        shinyImage: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
      });

      if (current.evolves_to && current.evolves_to.length > 0) {
        current = current.evolves_to[0];
      } else {
        current = null;
      }
    }
    return evolutions;
  }

  extractIdFromUrl(url: string): number {
    const parts = url.split('/').filter(part => part !== '');
    return Number(parts[parts.length - 1]);
  }

  toggleMega() {
    this.showMega = !this.showMega;
    if (this.showMega && this.megaForm) {
      const index = this.evolutionChain.findIndex(evo => evo.name === this.pokemon.name.toLowerCase());

      if (index !== -1) {
        if (!this.evolutionChain.some(evo => evo.name.includes('mega'))) {
          const image = this.megaForm.sprites.front_default || 'assets/icon/placeholder.png';
          const shinyImage = this.megaForm.sprites.front_shiny || image;
          this.evolutionChain.splice(index + 1, 0, {
            name: this.megaForm.name,
            image,
            shinyImage
          });
        }
      }
    } else {
      this.evolutionChain = this.evolutionChain.filter(evo => !evo.name.includes('mega'));
    }
  }

  toggleGmax() {
    this.showGmax = !this.showGmax;
    if (this.showGmax && this.gmaxForm) {
      const index = this.evolutionChain.findIndex(evo => evo.name === this.pokemon.name.toLowerCase());
      
      if (index !== -1) {
        if (!this.evolutionChain.some(evo => evo.name.includes('gmax'))) {
          const image = this.gmaxForm.sprites.front_default || 'assets/icon/placeholder.png';
          const shinyImage = this.gmaxForm.sprites.front_shiny || image;
          this.evolutionChain.splice(index + 1, 0, {
            name: this.gmaxForm.name,
            image,
            shinyImage
          });
        }
      }
    } else {
      this.evolutionChain = this.evolutionChain.filter(evo => !evo.name.includes('gmax'));
    }
  }

  get firstMoves(): string {
    return this.pokemon?.moves
      ?.slice(0, 5)
      ?.map((m: { move: { name: string } }) => m.move.name)
      .join(', ') || '';
  }

  get typeList(): string {
    return this.pokemon?.types
      ?.map((t: { type: { name: string } }) => t.type.name)
      .join(', ') || '';
  }

  get abilitiesList(): string {
    return this.pokemon?.abilities
      ?.map((a: { ability: { name: string } }) => a.ability.name)
      .join(', ') || '';
  }
}