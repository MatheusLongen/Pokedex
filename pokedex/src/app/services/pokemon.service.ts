import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  getPokemonList(offset: number, limit: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`);
  }

  getPokemonDetails(name: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/pokemon/${name}`);
  }

  getPokemonSpecies(name: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/pokemon-species/${name}`);
  }

  getEvolutionChainByUrl(url: string): Observable<any> {
    return this.http.get(url);
  }

  getAllPokemonNames(): Observable<any> {
    return this.http.get(`https://pokeapi.co/api/v2/pokemon?limit=10000`);
  }
}