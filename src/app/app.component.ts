import {
  Component,
  inject,
  signal,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs";
interface Project {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  type: string;
  year: string;
  description: string;
  stack: string[];
  role: string;
  notes: string[];
  image: string;
  gallery: string[];
  visual: string;
  accent: string;
  link: string;
}
interface Experience {
  company: string;
  role: string;
  date: string;
  text: string;
}
interface Community {
  id: string;
  name: string;
  role: string;
  text: string;
  image: string;
  label: string;
}
interface Portfolio {
  name: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  cv: string;
  projects: Project[];
  experience: Experience[];
  community: Community[];
}
@Component({
  selector: "app-root",
  standalone: true,
  templateUrl: "./app.component.html",
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private host = inject(ElementRef);
  private observer?: IntersectionObserver;
  private mutation?: MutationObserver;
  private sections?: IntersectionObserver;
  private previousFocus?: HTMLElement;
  private copyTimer?: ReturnType<typeof setTimeout>;
  @ViewChild("projectDialog") dialog?: ElementRef<HTMLDialogElement>;
  data = signal<Portfolio | null>(null);
  error = signal(false);
  mode = signal("Test");
  inspect = signal(false);
  bugFound = signal(false);
  demoFixed = signal(false);
  filter = signal("All");
  selected = signal<Project | null>(null);
  menu = signal(false);
  copied = signal(false);
  progress = signal(0);
  activeSection = signal("top");
  theme = signal<"dark" | "light">("dark");
  slide = signal(0);
  zoom = signal(false);
  modes = ["Test", "Build", "Teach"];
  filters = ["All", "Build", "Test"];
  notes: Record<string, { headline: string; copy: string; label: string }> = {
    Build: {
      headline: "From idea to working system.",
      copy: "Backend logic, mobile experiences, and the connections between them. I enjoy turning a real problem into software people can use.",
      label: "01 / Software engineer",
    },
    Test: {
      headline: "Good software stands up to questions.",
      copy: "What happens at the edge? What did we miss? Functional, exploratory, API, and UI automation testing—with evidence that helps teams improve.",
      label: "02 / QA tester",
    },
    Teach: {
      headline: "Knowledge works better when shared.",
      copy: "From a first Python project to C++ contest training. Helping people build confidence is a part of engineering I keep coming back to.",
      label: "03 / Instructor & mentor",
    },
  };
  constructor() {
    try {
      const saved = localStorage.getItem("hn-theme");
      if (saved === "light" || saved === "dark") this.theme.set(saved);
    } catch {}
    document.documentElement.dataset["theme"] = this.theme();
    this.http
      .get<Portfolio>("/api/portfolio")
      .pipe(catchError(() => this.http.get<Portfolio>("/data/portfolio.json")))
      .subscribe({
        next: (d) => this.data.set(d),
        error: () => this.error.set(true),
      });
  }
  get projects() {
    return (this.data()?.projects || []).filter(
      (p) => this.filter() === "All" || p.category === this.filter(),
    );
  }
  get currentImage() {
    const p = this.selected();
    return p ? p.gallery[this.slide()] || p.image : "";
  }
  toggleTheme() {
    const next = this.theme() === "dark" ? "light" : "dark";
    this.theme.set(next);
    document.documentElement.dataset["theme"] = next;
    try {
      localStorage.setItem("hn-theme", next);
    } catch {}
  }
  chooseMode(value: string) {
    if (this.mode() === value) return;
    this.mode.set(value);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
      this.host.nativeElement.querySelector(".mode-note")?.animate(
        [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 400, easing: "ease-out" },
      );
  }
  chooseFilter(value: string) {
    const change = () => this.filter.set(value);
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => unknown;
    };
    if (
      doc.startViewTransition &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      doc.startViewTransition(change);
    else change();
  }
  openProject(p: Project) {
    this.previousFocus = document.activeElement as HTMLElement;
    this.selected.set(p);
    this.slide.set(0);
    this.zoom.set(false);
    this.dialog?.nativeElement.showModal();
    document.body.classList.add("modal-open");
  }
  closeProject() {
    this.dialog?.nativeElement.close();
  }
  onDialogClosed() {
    document.body.classList.remove("modal-open");
    this.zoom.set(false);
    this.previousFocus?.focus();
  }
  dialogClick(event: MouseEvent) {
    if (event.target === this.dialog?.nativeElement) this.closeProject();
  }
  changeSlide(delta: number) {
    const n = this.selected()?.gallery.length || 1;
    this.slide.set((this.slide() + delta + n) % n);
    this.zoom.set(false);
  }
  galleryKeys(event: KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      this.changeSlide(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      this.changeSlide(-1);
    }
  }
  async copyEmail() {
    const email = this.data()?.email;
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      this.copied.set(true);
      clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => this.copied.set(false), 2200);
    } catch {
      window.location.href = "mailto:" + email;
    }
  }
  scroll = () => {
    const range = document.documentElement.scrollHeight - innerHeight;
    this.progress.set(range > 0 ? scrollY / range : 0);
  };
  ngAfterViewInit() {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("seen");
            this.observer?.unobserve(entry.target);
          }
        }),
      { threshold: 0.07 },
    );
    const observe = () =>
      this.host.nativeElement
        .querySelectorAll("[data-reveal]:not([data-observed])")
        .forEach((el: HTMLElement) => {
          el.dataset["observed"] = "1";
          if (reduced) el.classList.add("seen");
          else {
            el.classList.add("will-reveal");
            this.observer?.observe(el);
          }
        });
    this.mutation = new MutationObserver(observe);
    this.mutation.observe(this.host.nativeElement, {
      childList: true,
      subtree: true,
    });
    observe();
    this.sections = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) this.activeSection.set(entry.target.id);
        }),
      { rootMargin: "-10% 0px -60% 0px", threshold: 0 },
    );
    this.host.nativeElement
      .querySelectorAll("main>section[id]")
      .forEach((el: Element) => this.sections?.observe(el));
    addEventListener("scroll", this.scroll, { passive: true });
    this.scroll();
  }
  ngOnDestroy() {
    this.observer?.disconnect();
    this.mutation?.disconnect();
    this.sections?.disconnect();
    removeEventListener("scroll", this.scroll);
    clearTimeout(this.copyTimer);
    document.body.classList.remove("modal-open");
  }
}
