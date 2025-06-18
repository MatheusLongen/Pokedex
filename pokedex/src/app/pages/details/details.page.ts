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

  constructor(
    private route: ActivatedRoute,
    private pokeService: PokemonService
  ) {}

  async ngOnInit() {
    this.name = this.route.snapshot.paramMap.get('name') || '';
    this.pokemon = await firstValueFrom(this.pokeService.getPokemonDetails(this.name));

    const species = await firstValueFrom(this.pokeService.getPokemonSpecies(this.name)) as any;
    const chainUrl = species.evolution_chain.url;
    const evoData = await firstValueFrom(this.pokeService.getEvolutionChainByUrl(chainUrl)) as any;
    this.evolutionChain = this.extractEvolutions(evoData.chain);
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
      current = current.evolves_to[0];
    }

    return evolutions;
  }

  extractIdFromUrl(url: string): number {
    const parts = url.split('/');
    return Number(parts[parts.length - 2]);
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